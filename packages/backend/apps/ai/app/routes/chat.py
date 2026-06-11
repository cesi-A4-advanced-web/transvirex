from fastapi import APIRouter
from pydantic import BaseModel
from ..services.rag import rag_chat

router = APIRouter(tags=["chat"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    answer: str


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    history = [m.model_dump() for m in body.history]
    answer = await rag_chat(body.message, history)
    return ChatResponse(answer=answer)
