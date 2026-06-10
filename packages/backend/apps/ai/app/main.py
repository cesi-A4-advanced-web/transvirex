import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .database import close_db
from .mcp.host import host
from .routes import chat, incidents, knowledge, process, notifications

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await host.start()
    except Exception:
        logger.exception("MCP host failed to start — agent tools disabled")
    yield
    await host.stop()
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
