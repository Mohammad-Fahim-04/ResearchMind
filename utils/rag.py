from agents import llm
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from utils.retriever import retrieve_chunks


chat_prompt = ChatPromptTemplate.from_messages([
    ("system", """You answer questions using only the supplied research context.
Give a concise, natural answer to the user's question. Do not invent facts.
If the context does not contain enough information, say that the research does not provide enough information to answer.
Do not include source labels, raw URLs, source dumps, or phrases such as 'Based on the retrieved research' unless the user explicitly asks for sources."""),
    ("human", """Research topic: {topic}

Question: {question}

Research context:
{context}"""),
])

chat_chain = chat_prompt | llm | StrOutputParser()

def build_rag_context(query, research_id, limit=5):
    results = retrieve_chunks(query, research_id, limit)

    context = "\n\n".join(
        f"[Source {i + 1}]\n{item['text']}"
        for i, item in enumerate(results)
    )

    return context


def answer_with_rag(query, research_id, topic, report=""):
    context = build_rag_context(query, research_id, limit=5)
    if report:
        context = f"Research topic: {topic}\n\nResearch report:\n{report}\n\nRetrieved research context:\n{context}"
    if not context:
        return "I couldn't find enough information about that in this research."

    answer = chat_chain.invoke({
        "question": query,
        "topic": topic,
        "context": context,
    }).strip()
    return answer or "I couldn't find enough information about that in this research."