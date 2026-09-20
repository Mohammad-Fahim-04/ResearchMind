def chunk_text(text, chunk_size=1000, overlap=200):
    words = text.split()
    chunks = []

    current = []
    current_length = 0

    for word in words:
        if current_length + len(word) + 1 > chunk_size:
            chunks.append(" ".join(current))

            overlap_words = []
            length = 0

            for w in reversed(current):
                if length + len(w) + 1 > overlap:
                    break

                overlap_words.insert(0, w)
                length += len(w) + 1

            current = overlap_words
            current_length = length

        current.append(word)
        current_length += len(word) + 1

    if current:
        chunks.append(" ".join(current))

    return chunks