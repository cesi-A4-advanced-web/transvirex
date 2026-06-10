from fastapi import APIRouter
from pydantic import BaseModel
from ..services.intent import detect_intent
from ..services.incidents import process_incident
from ..services.rag import rag_chat

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
    intent = await detect_intent(body.text)

    if intent == "incident":
        incident = await process_incident(body.text, body.driver_id, body.delivery_id)
        severity_labels = {
            "CRITICAL": "critique",
            "HIGH": "élevée",
            "MEDIUM": "modérée",
            "LOW": "faible",
        }
        label = severity_labels.get(incident["severity"], incident["severity"])
        notif = " Le dispatcher a été notifié." if incident["notified"] else ""
        answer = f"Incident enregistré (sévérité {label}). {incident['summary']}.{notif}"
        return ProcessResponse(type="incident", answer=answer, incident=incident)

    # Fallback to RAG chat (also when incident detected but no delivery_id)
    answer = await rag_chat(body.text)
    return ProcessResponse(type="chat", answer=answer)
