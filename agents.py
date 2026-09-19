from langchain.agents import create_agent
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from tools import web_search, scrape_url
from dotenv import load_dotenv

load_dotenv()

# model setup
llm = ChatMistralAI(
    model="ministral-14b-latest",
    temperature=0
)

# 1st agent
def build_search_agent():
    return create_agent(
        model=llm,
        tools=[web_search]
    )

#2nd agent
def build_reader_agent():
    return create_agent(
        model=llm,
        tools=[scrape_url]
    )


#writer chain 

writer_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert research writer. Use only the supplied research material.
Do not invent facts, statistics, citations, source names, or URLs. If the material is limited,
say so explicitly. Write in Markdown and make every important claim traceable to the supplied sources."""),
    ("human", """Write a genuinely detailed research report on the topic below.

Topic: {topic}

Actual Tavily Search Results (JSON):
{research}

Detailed Scraped Content:
{scraped_content}

Use this structure exactly:
# Title
## Executive Summary
## Introduction
## Background / Context
## Key Findings
Include at least 5 numbered, detailed findings. Give each finding enough explanation to be useful,
including multiple paragraphs when the evidence supports it.
## Important Data / Evidence
Only include data actually present in the supplied material.
## Different Perspectives or Impacts
## Risks / Challenges
## Future Outlook
## Conclusion
## Sources
List each unique source actually present in the Tavily JSON as:
1. Source title — [URL](URL)
Never create a URL or use a source that is not in the JSON.

Target approximately 1000-1500 words when the evidence supports it. Do not pad the report with generic
information unrelated to the topic. Clearly identify gaps in the available research."""),
])

writer_chain = writer_prompt | llm | StrOutputParser()

#critic_chain 

critic_prompt = ChatPromptTemplate.from_messages([
     ("system", "You are a sharp and constructive research critic. Be honest and specific."),
    ("human", """Review the research report below and evaluate it strictly.

Report:
{report}

Respond in this exact format:

Score: X/10

Strengths:
- ...
- ...

Areas to Improve:
- ...
- ...

One line verdict:
..."""),
])

critic_chain = critic_prompt | llm | StrOutputParser()