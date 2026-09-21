from qdrant_client import QdrantClient
from qdrant_client.models import FieldCondition, Filter, MatchValue
from utils.embeddings import create_embeddings

client = QdrantClient(path="./qdrant_data")

COLLECTION_NAME = "researchmind"


def retrieve_chunks(query, research_id, limit=5):
    query_embedding = create_embeddings([query])[0]

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="research_id",
                    match=MatchValue(value=research_id),
                )
            ]
        ),
        limit=limit
    )

    return [
        {
            "text": point.payload["text"],
            "score": point.score
        }
        for point in results.points
    ]