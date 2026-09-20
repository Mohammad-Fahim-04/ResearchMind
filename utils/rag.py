from utils.retriever import retrieve_chunks

def build_rag_context(query, limit=5):
    results = retrieve_chunks(query, limit)

    context = "\n\n".join(
        f"[Source {i + 1}]\n{item['text']}"
        for i, item in enumerate(results)
    )

    return context


def answer_with_rag(query):
    results = retrieve_chunks(query, limit=5)
    if not results:
        return "I could not find this information in the research."

    sources = [
        f"[Source {index}]\n{item['text']}"
        for index, item in enumerate(results, start=1)
    ]
    return "Based on the retrieved research:\n\n" + "\n\n".join(sources)