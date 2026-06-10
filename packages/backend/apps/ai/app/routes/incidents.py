from fastapi import APIRouter
from pydantic import BaseModel
from ..database import get_db
from ..services.incidents import process_incident

router = APIRouter(tags=["incidents"])


class IncidentRequest(BaseModel):
    text: str
    driver_id: str
    delivery_id: str


class IncidentResponse(BaseModel):
    id: str
    severity: str
    summary: str
    notified: bool
    created_at: str


@router.post("/incidents", response_model=IncidentResponse)
async def declare_incident(body: IncidentRequest):
    result = await process_incident(body.text, body.driver_id, body.delivery_id)
    return IncidentResponse(**result)


@router.get("/incidents/{delivery_id}")
async def get_incidents(delivery_id: str):
    db = await get_db()
    docs = (
        await db["incidents"]
        .find({"delivery_id": delivery_id})
        .sort("created_at", -1)
        .to_list(50)
    )
    incidents = []
    for d in docs:
        d["id"] = str(d.pop("_id"))
        d["created_at"] = d["created_at"].isoformat()
        incidents.append(d)
    return {"incidents": incidents}
