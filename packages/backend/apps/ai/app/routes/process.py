from fastapi import APIRouter
from pydantic import BaseModel

from ..agent import run_agent

router = APIRouter(tags=["process"])


class ProcessRequest(BaseModel):
    text: str
    driver_id: str
    delivery_id: str | None = None


class ProcessResponse(BaseModel):
    type: str
    answer: str
    incident: dict | None = None


@router.post("/process", response_model=ProcessResponse)
async def process(body: ProcessRequest):
    """Agentic endpoint: DeepSeek decides which MCP tools to call."""
    result = await run_agent(body.text, body.driver_id, body.delivery_id)
    return ProcessResponse(**result)
