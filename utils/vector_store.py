from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient(path="./qdrant_data")

COLLECTION_NAME = "researchmind"


def create_collection():
    collections = [
        c.name for c in client.get_collections().collections
    ]

    if COLLECTION_NAME not in collections:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=384,
                distance=Distance.COSINE
            )
        )


def store_embeddings(embeddings, chunks):
    create_collection()

    points = [
        PointStruct(
            id=i,
            vector=embedding,
            payload={
                "text": chunk
            }
        )
        for i, (embedding, chunk) in enumerate(
            zip(embeddings, chunks)
        )
    ]

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )

    return len(points)