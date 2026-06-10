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


<<<<<<< HEAD
async def persist_incident(
    text: str,
    driver_id: str,
    severity: str,
    summary: str,
    delivery_id: str | None = None,
    notify: bool | None = None,
) -> dict:
    """Store an incident and, for serious ones, a dispatcher notification.

    `severity`/`summary` are provided by the caller (the agent decides them).
    When `notify` is None, notification is automatic for CRITICAL/HIGH.
    """
    if severity not in _SEVERITY_LEVELS:
        severity = "MEDIUM"
    summary = summary or text[:300]
=======
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
>>>>>>> 3cf97f20 (feat: add AI service configuration, database connection, and RAG functionality)

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

<<<<<<< HEAD
    should_notify = notify if notify is not None else severity in ("CRITICAL", "HIGH")
    if should_notify:
        await db["notifications"].insert_one(
            {
                "incident_id": str(result.inserted_id),
                "driver_id": driver_id,
                "delivery_id": delivery_id or "",
                "summary": summary,
                "severity": severity,
                "read": False,
                "created_at": datetime.now(timezone.utc),
            }
        )
=======
    notified = False
    if severity in ("CRITICAL", "HIGH"):
        await _call_delivery_service(delivery_id, summary, severity, driver_id)
        await db["notifications"].insert_one(
            {
                "incident_id": str(result.inserted_id),
                "driver_id": driver_id,
                "delivery_id": delivery_id,
                "summary": summary,
                "severity": severity,
                "read": False,
                "created_at": datetime.now(timezone.utc),
            }
        )
        notified = True
>>>>>>> 3cf97f20 (feat: add AI service configuration, database connection, and RAG functionality)

    return {
        "id": str(result.inserted_id),
        "severity": severity,
        "summary": summary,
<<<<<<< HEAD
        "notified": should_notify,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


async def process_incident(
    text: str,
    driver_id: str,
    delivery_id: str | None = None,
) -> dict:
    """Analyse an incident with the LLM then persist it (used by /incidents)."""
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
    summary = analysis.get("summary") or text[:300]

    if severity in ("CRITICAL", "HIGH") and delivery_id:
        await _call_delivery_service(delivery_id, summary, severity, driver_id)

    return await persist_incident(text, driver_id, severity, summary, delivery_id)
=======
        "notified": notified,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
>>>>>>> 3cf97f20 (feat: add AI service configuration, database connection, and RAG functionality)
