from fastapi import APIRouter
from pydantic import BaseModel
from ..services.rag import ingest_document

router = APIRouter(tags=["knowledge"])


class DocumentRequest(BaseModel):
    content: str
    metadata: dict = {}


class DocumentResponse(BaseModel):
    id: str


@router.post("/knowledge", response_model=DocumentResponse)
async def ingest(body: DocumentRequest):
    doc_id = await ingest_document(body.content, body.metadata)
    return DocumentResponse(id=doc_id)
