import json
from datetime import datetime, timezone
from ..database import get_db
from .deepseek import chat_completion

_SEVERITY_LEVELS = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}

_ANALYSIS_PROMPT = """Analyse cet incident de livraison déclaré par un chauffeur.
Réponds UNIQUEMENT avec un objet JSON valide (sans bloc markdown) avec exactement ces deux champs :
{{
  "severity": "CRITICAL|HIGH|MEDIUM|LOW",
  "summary": "résumé de l'incident en une phrase"
}}

Critères de sévérité :
- CRITICAL : accident, blessure, urgence médicale, colis volé
- HIGH : retard important (+2h), colis endommagé, problème de sécurité
- MEDIUM : retard mineur, difficultés d'accès, client absent
- LOW : note informative, demande de changement mineure

Incident signalé : {text}"""


async def _call_delivery_service(delivery_id: str, summary: str, severity: str, driver_id: str) -> None:
    """Create a DeliveryEvent in the delivery service for high/critical incidents."""
    import httpx
    from ..config import settings

    severity_to_event_type = {
        "CRITICAL": "critical",
        "HIGH": "warning",
        "MEDIUM": "info",
        "LOW": "note",
    }
    status = "waiting" if severity in ("CRITICAL", "HIGH") else "information"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(
                f"{settings.delivery_service_url}/deliveries/{delivery_id}/events",
                json={
                    "description": summary,
                    "type": severity_to_event_type[severity],
                    "status": status,
                },
                headers={"X-User-Id": driver_id},
            )
    except httpx.RequestError:
        pass


async def process_incident(
    text: str,
    driver_id: str,
    delivery_id: str,
) -> dict:
    raw = await chat_completion(
        [{"role": "user", "content": _ANALYSIS_PROMPT.format(text=text)}]
    )

    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        analysis = json.loads(raw[start:end])
    except (ValueError, IndexError):
        analysis = {}

    severity = analysis.get("severity", "MEDIUM")
    if severity not in _SEVERITY_LEVELS:
        severity = "MEDIUM"
    summary = analysis.get("summary") or text[:300]

    db = await get_db()
    result = await db["incidents"].insert_one(
        {
            "text": text,
            "severity": severity,
            "summary": summary,
            "driver_id": driver_id,
            "delivery_id": delivery_id,
            "created_at": datetime.now(timezone.utc),
        }
    )

    notified = False
    if severity in ("CRITICAL", "HIGH"):
        await _call_delivery_service(delivery_id, summary, severity, driver_id)
        notified = True

    return {
        "id": str(result.inserted_id),
        "severity": severity,
        "summary": summary,
        "notified": notified,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
