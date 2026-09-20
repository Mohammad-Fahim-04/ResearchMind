from qdrant_client import QdrantClient
from utils.embeddings import create_embeddings

client = QdrantClient(path="./qdrant_data")

COLLECTION_NAME = "researchmind"


def retrieve_chunks(query, limit=5):
    query_embedding = create_embeddings([query])[0]

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        limit=limit
    )

    return [
        {
            "text": point.payload["text"],
            "score": point.score
        }
        for point in results.points
    ]