import json
import sys

from agents import build_reader_agent, build_search_agent, writer_chain, critic_chain


def _log_status(message):
    """Keep subprocess stdout reserved for the final JSON payload."""
    print(message, file=sys.stderr, flush=True)


def _parse_json_content(content):
    if isinstance(content, (dict, list)):
        return content
    if not isinstance(content, str):
        return None
    candidate = content.strip()
    if candidate.startswith("```"):
        candidate = candidate.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        return None


def _extract_search_results(messages):
    for message in reversed(messages):
        parsed = _parse_json_content(getattr(message, "content", ""))
        if isinstance(parsed, list) and all(isinstance(item, dict) for item in parsed):
            results = []
            seen_urls = set()
            for item in parsed:
                url = item.get("url")
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    results.append({
                        "title": item.get("title", "Untitled source"),
                        "url": url,
                        "content": item.get("content", ""),
                    })
            if results:
                return results
    raise ValueError("The search agent did not return structured Tavily results.")


def _extract_tool_text(messages):
    for message in reversed(messages):
        if message.__class__.__name__ == "ToolMessage":
            return getattr(message, "content", "")
    return messages[-1].content


def _append_verified_sources(report, sources):
    source_lines = ["## Sources", ""]
    for index, source in enumerate(sources, start=1):
        title = source["title"].replace("[", "\\[").replace("]", "\\]")
        url = source["url"]
        source_lines.append(f"{index}. {title} — [{url}]({url})")
    source_section = "\n".join(source_lines)
    if "## Sources" in report:
        report = report.split("## Sources", 1)[0].rstrip()
    return f"{report}\n\n{source_section}"

def run_research_pipeline(topic : str) -> dict:

    state = {"topic": topic, "statuses": {"search": "RUNNING"}}

    #search agent working 
    _log_status("step 1 - search agent is working")

    search_agent = build_search_agent()
    search_result = search_agent.invoke({
        "messages" : [("user", f"Use the web_search tool for this topic: {topic}. Return the exact JSON array from the tool, with each item's title, url, and content. Do not summarize it or invent sources.")]
    })
    state["search_results"] = _extract_search_results(search_result["messages"])
    state["statuses"]["search"] = "DONE"
    state["statuses"]["reader"] = "RUNNING"

    _log_status(f"step 1 complete - {len(state['search_results'])} sources found")

    #step 2 - reader agent 
    _log_status("step 2 - reader agent is scraping a top resource")

    reader_agent = build_reader_agent()
    reader_result = reader_agent.invoke({
        "messages": [("user",
            f"Based on the following search results about '{topic}', "
            f"pick the most relevant URL and scrape it for deeper content.\n\n"
            f"Search Results:\n{json.dumps(state['search_results'], indent=2)}"
        )]
    })

    state["scraped_content"] = _extract_tool_text(reader_result["messages"])
    state["statuses"]["reader"] = "DONE"
    state["statuses"]["writer"] = "RUNNING"

    _log_status("step 2 complete - scraped content received")

    #step 3 - writer chain 

    _log_status("step 3 - writer is drafting the report")

    state["report"] = writer_chain.invoke({
        "topic" : topic,
        "research" : json.dumps(state["search_results"], indent=2),
        "scraped_content": state["scraped_content"],
    })
    state["report"] = _append_verified_sources(state["report"], state["search_results"])
    state["statuses"]["writer"] = "DONE"
    state["statuses"]["critic"] = "RUNNING"

    _log_status("step 3 complete - report drafted")

    #critic report 

    _log_status("step 4 - critic is reviewing the report")

    state["feedback"] = critic_chain.invoke({
        "report":state['report']
    })
    state["statuses"]["critic"] = "DONE"

    _log_status("step 4 complete - critic feedback received")

    return state



if __name__ == "__main__":
    topic = input("\n Enter a research topic : ")
    run_research_pipeline(topic)
