<<<<<<< HEAD
import re
from datetime import datetime, timezone
from ..database import get_db
from .deepseek import chat_completion
=======
import numpy as np
from datetime import datetime, timezone
from ..database import get_db
from .deepseek import get_embedding, chat_completion
>>>>>>> 3cf97f20 (feat: add AI service configuration, database connection, and RAG functionality)

_RAG_COLLECTION = "rag_documents"


async def ingest_document(content: str, metadata: dict | None = None) -> str:
    db = await get_db()
<<<<<<< HEAD
    result = await db[_RAG_COLLECTION].insert_one(
        {
            "content": content,
=======
    embedding = await get_embedding(content)
    result = await db[_RAG_COLLECTION].insert_one(
        {
            "content": content,
            "embedding": embedding,
>>>>>>> 3cf97f20 (feat: add AI service configuration, database connection, and RAG functionality)
            "metadata": metadata or {},
            "created_at": datetime.now(timezone.utc),
        }
    )
<<<<<<< HEAD
    # Ensure a text index exists for keyword search (idempotent)
    await db[_RAG_COLLECTION].create_index([("content", "text")], background=True)
    return str(result.inserted_id)


async def _keyword_search(query: str, top_k: int = 5) -> list[dict]:
    """Search documents using MongoDB $text index; fall back to full scan."""
    db = await get_db()

    # Try text index search
    try:
        cursor = db[_RAG_COLLECTION].find(
            {"$text": {"$search": query}},
            {"score": {"$meta": "textScore"}, "content": 1, "metadata": 1, "_id": 0},
        ).sort([("score", {"$meta": "textScore"})]).limit(top_k)
        docs = await cursor.to_list(top_k)
        if docs:
            return [{"content": d["content"], "metadata": d.get("metadata", {})} for d in docs]
    except Exception:
        pass

    # Fallback: simple regex search on significant words
    words = [w for w in re.split(r"\W+", query) if len(w) > 3]
    pattern = "|".join(re.escape(w) for w in words) if words else query
    try:
        cursor = db[_RAG_COLLECTION].find(
            {"content": {"$regex": pattern, "$options": "i"}},
            {"content": 1, "metadata": 1, "_id": 0},
        ).limit(top_k)
        docs = await cursor.to_list(top_k)
        if docs:
            return [{"content": d["content"], "metadata": d.get("metadata", {})} for d in docs]
    except Exception:
        pass

    # Last resort: return most recent documents
    cursor = db[_RAG_COLLECTION].find(
        {}, {"content": 1, "metadata": 1, "_id": 0}
    ).sort("created_at", -1).limit(top_k)
    docs = await cursor.to_list(top_k)
    return [{"content": d["content"], "metadata": d.get("metadata", {})} for d in docs]


async def search_knowledge(query: str, top_k: int = 5) -> list[str]:
    """Return the most relevant knowledge-base snippets for a query (tool helper)."""
    docs = await _keyword_search(query, top_k)
    return [d["content"] for d in docs]


async def rag_chat(question: str, history: list[dict] | None = None) -> str:
    context_docs = await _keyword_search(question)
    context = "\n\n---\n\n".join(d["content"] for d in context_docs) if context_docs else ""

    if context:
        system = (
            "Tu es l'assistant logistique de Transvirex ERP. "
            "Réponds en français en utilisant le contexte ci-dessous si pertinent. "
            "Si le contexte ne contient pas l'information, réponds à partir de tes connaissances générales en logistique.\n\n"
            f"Contexte:\n{context}"
        )
    else:
        system = (
            "Tu es l'assistant logistique de Transvirex ERP. "
            "Réponds en français. Tu aides les chauffeurs-livreurs dans leur travail quotidien : "
            "gestion des livraisons, incidents, relation client, procédures opérationnelles."
        )
=======
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
>>>>>>> 3cf97f20 (feat: add AI service configuration, database connection, and RAG functionality)

    messages = list(history or []) + [{"role": "user", "content": question}]
    return await chat_completion(messages, system=system)
