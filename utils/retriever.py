from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue
from utils.embeddings import model

client = QdrantClient(path="./qdrant_data")

COLLECTION_NAME = "researchmind"


def retrieve_chunks(query, limit=5):
    query_embedding = model.encode(query).tolist()

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