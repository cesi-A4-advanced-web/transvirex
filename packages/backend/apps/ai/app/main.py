import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .data.knowledge_base import KNOWLEDGE_DOCS
from .database import close_db
from .routes import chat, incidents, knowledge, process, notifications
from .services.rag import seed_knowledge

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        seeded = await seed_knowledge(KNOWLEDGE_DOCS)
        logger.info("Knowledge base seeded: %d documents upserted", seeded)
    except Exception:
        logger.exception("Knowledge base seed failed (continuing without seed)")
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
app.include_router(process.router, prefix="/ai")
app.include_router(notifications.router, prefix="/ai")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai"}
