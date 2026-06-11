from fastapi import APIRouter
from bson import ObjectId
from ..database import get_db

router = APIRouter(tags=["notifications"])


@router.get("/notifications")
async def get_notifications(unread_only: bool = False):
    db = await get_db()
    query = {"read": False} if unread_only else {}
    docs = (
        await db["notifications"]
        .find(query)
        .sort("created_at", -1)
        .to_list(100)
    )
    notifications = []
    for d in docs:
        d["id"] = str(d.pop("_id"))
        d["created_at"] = d["created_at"].isoformat()
        notifications.append(d)
    return {
        "notifications": notifications,
        "unread_count": await db["notifications"].count_documents({"read": False}),
    }


@router.post("/notifications/{notification_id}/read")
async def mark_read(notification_id: str):
    db = await get_db()
    await db["notifications"].update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"read": True}},
    )
    return {"success": True}
