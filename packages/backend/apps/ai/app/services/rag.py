import numpy as np
from datetime import datetime, timezone
from ..database import get_db
from .deepseek import get_embedding, chat_completion

_RAG_COLLECTION = "rag_documents"


async def ingest_document(content: str, metadata: dict | None = None) -> str:
    db = await get_db()
    embedding = await get_embedding(content)
    result = await db[_RAG_COLLECTION].insert_one(
        {
            "content": content,
            "embedding": embedding,
            "metadata": metadata or {},
            "created_at": datetime.now(timezone.utc),
        }
    )
    return str(result.inserted_id)


async def semantic_search(query: str, top_k: int = 5) -> list[dict]:
    db = await get_db()
    query_vec = np.array(await get_embedding(query))

    docs = await db[_RAG_COLLECTION].find(
        {}, {"content": 1, "embedding": 1, "metadata": 1}
    ).to_list(None)

    if not docs:
        return []

    scored = []
    for doc in docs:
        emb = np.array(doc["embedding"])
        norm = np.linalg.norm(query_vec) * np.linalg.norm(emb)
        score = float(np.dot(query_vec, emb) / norm) if norm else 0.0
        scored.append((score, doc))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [
        {"content": d["content"], "metadata": d["metadata"], "score": s}
        for s, d in scored[:top_k]
    ]


async def rag_chat(question: str, history: list[dict] | None = None) -> str:
    context_docs = await semantic_search(question)
    context = "\n\n---\n\n".join(d["content"] for d in context_docs)

    system = (
        "Tu es l'assistant logistique de Transvirex ERP. "
        "Réponds en français en utilisant le contexte ci-dessous si pertinent. "
        "Si le contexte ne contient pas l'information, indique-le clairement.\n\n"
        f"Contexte:\n{context}"
    )

    messages = list(history or []) + [{"role": "user", "content": question}]
    return await chat_completion(messages, system=system)
