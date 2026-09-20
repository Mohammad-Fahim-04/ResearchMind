from utils.retriever import retrieve_chunks


def build_rag_context(query, limit=5):
    results = retrieve_chunks(query, limit)

    context = "\n\n".join(
        f"[Source {i + 1}]\n{item['text']}"
        for i, item in enumerate(results)
    )

    return context