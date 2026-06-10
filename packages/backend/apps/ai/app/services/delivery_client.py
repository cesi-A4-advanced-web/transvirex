"""Thin HTTP client for the delivery microservice."""
import httpx

from ..config import settings


async def list_driver_deliveries(user_id: str) -> dict:
    """Return the active deliveries of a driver (identified by their User id)."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{settings.delivery_service_url}/drivers/{user_id}/deliveries"
            )
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPError as exc:
        return {"deliveries": [], "error": f"service delivery injoignable: {exc}"}


async def create_delivery_event(
    delivery_id: str,
    description: str,
    event_type: str,
    status: str,
    driver_id: str | None = None,
) -> dict:
    """Create a DeliveryEvent on a delivery via the delivery service."""
    headers = {"X-User-Id": driver_id} if driver_id else {}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{settings.delivery_service_url}/deliveries/{delivery_id}/events",
                json={"description": description, "type": event_type, "status": status},
                headers=headers,
            )
            resp.raise_for_status()
            return {"ok": True, "event": resp.json()}
    except httpx.HTTPError as exc:
        return {"ok": False, "error": f"création de l'événement impossible: {exc}"}
