import hashlib
import math
import re

EMBEDDING_DIMENSION = 384
TOKEN_PATTERN = re.compile(r"[a-z0-9]+")


def _embed_text(text):
    vector = [0.0] * EMBEDDING_DIMENSION
    tokens = TOKEN_PATTERN.findall(str(text).lower())

    for token in tokens:
        digest = hashlib.blake2b(token.encode('utf-8'), digest_size=8).digest()
        index = int.from_bytes(digest[:4], 'little') % EMBEDDING_DIMENSION
        sign = 1.0 if digest[4] & 1 else -1.0
        vector[index] += sign

    norm = math.sqrt(sum(value * value for value in vector))
    if norm:
        vector = [value / norm for value in vector]
    return vector


def create_embeddings(chunks):
    return [_embed_text(chunk) for chunk in chunks]