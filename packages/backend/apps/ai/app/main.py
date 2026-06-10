from contextlib import asynccontextmanager
from fastapi import FastAPI
from mcp.server.fastmcp import FastMCP

from .database import close_db
from .routes import chat, incidents, knowledge
from .services.rag import rag_chat, ingest_document
from .services.incidents import process_incident


# ---------------------------------------------------------------------------
# MCP server — exposes AI tools to any MCP-compatible client (Claude, etc.)
# Mounted at /mcp/sse  (SSE transport)
# ---------------------------------------------------------------------------
mcp = FastMCP(
    "transvirex-ai",
    description="Assistant logistique Transvirex — incidents, RAG, base de connaissances",
)


@mcp.tool()
async def chat_with_assistant(question: str) -> str:
    """Interroge l'assistant logistique Transvirex via RAG."""
    return await rag_chat(question)


@mcp.tool()
async def declare_incident(text: str, driver_id: str, delivery_id: str) -> str:
    """
    Déclare un incident de livraison.
    Analyse la sévérité, stocke l'incident et notifie le dispatcher si nécessaire.
    """
    result = await process_incident(text, driver_id, delivery_id)
    return (
        f"Incident enregistré (ID: {result['id']}, sévérité: {result['severity']}). "
        f"Résumé: {result['summary']}. "
        f"Dispatcher notifié: {result['notified']}"
    )


@mcp.tool()
async def add_to_knowledge_base(content: str, category: str = "general") -> str:
    """Ajoute un document dans la base de connaissances RAG."""
    doc_id = await ingest_document(content, {"category": category})
    return f"Document indexé avec l'ID: {doc_id}"


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_db()


app = FastAPI(
    title="Transvirex AI Service",
    description="Service IA : RAG, incidents, assistant logistique",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(chat.router, prefix="/ai")
app.include_router(incidents.router, prefix="/ai")
app.include_router(knowledge.router, prefix="/ai")

# Mount MCP SSE server — accessible at /mcp/sse
app.mount("/mcp", mcp.get_asgi_app())


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai"}
