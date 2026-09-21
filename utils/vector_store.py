from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient(path="./qdrant_data")

COLLECTION_NAME = "researchmind"
VECTOR_SIZE = 384


def create_collection():
    if client.collection_exists(COLLECTION_NAME):
        return

    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=VECTOR_SIZE,
            distance=Distance.COSINE,
        ),
    )


def store_embeddings(embeddings, chunks):
    create_collection()

    points = [
        PointStruct(
            id=i,
            vector=embedding,
            payload={"text": chunk},
        )
        for i, (embedding, chunk) in enumerate(zip(embeddings, chunks))
    ]

    if not points:
        return 0

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points,
    )

    return len(points)