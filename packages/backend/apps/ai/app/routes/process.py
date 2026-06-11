from fastapi import APIRouter
from pydantic import BaseModel

from ..agent import run_agent

router = APIRouter(tags=["process"])


class HistoryMessage(BaseModel):
    role: str
    content: str


class ProcessRequest(BaseModel):
    text: str
    driver_id: str
    delivery_id: str | None = None
    history: list[HistoryMessage] | None = None


class ProcessResponse(BaseModel):
    type: str
    answer: str
    incident: dict | None = None


@router.post("/process", response_model=ProcessResponse)
async def process(body: ProcessRequest):
    """Agentic endpoint: DeepSeek decides which MCP tools to call."""
    history = [h.model_dump() for h in body.history] if body.history else None
    result = await run_agent(body.text, body.driver_id, body.delivery_id, history)
    return ProcessResponse(**result)
