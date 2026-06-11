"""MCP server exposing Transvirex web-app actions as tools.

Run standalone over stdio (e.g. for Claude Desktop / Cursor):

    python -m app.mcp.server

The in-app AI host connects to this same server to drive DeepSeek with
tool-calling. Tools wrap the existing services (MongoDB) and the delivery
microservice (HTTP).
"""
from typing import Literal

from mcp.server.fastmcp import FastMCP

from ..services.delivery_client import create_delivery_event as _create_event
from ..services.delivery_client import list_driver_deliveries as _list_deliveries
from ..services.incidents import persist_incident
from ..services.rag import search_knowledge as _search_knowledge

mcp = FastMCP("transvirex-webapp")

Severity = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]


@mcp.tool()
async def list_driver_deliveries(driver_id: str) -> dict:
    """Liste les livraisons en cours d'un chauffeur (par son User id / JWT sub).

    À utiliser pour identifier de quelle livraison parle le chauffeur quand il
    ne donne pas d'identifiant précis. Renvoie référence, statut, client et
    adresse de chaque livraison active.
    """
    return await _list_deliveries(driver_id)


@mcp.tool()
async def create_dispatcher_notification(
    driver_id: str,
    summary: str,
    severity: Severity,
    delivery_id: str | None = None,
) -> dict:
    """Crée une notification côté dispatcher pour un incident chauffeur.

    `summary` : résumé en une phrase de l'incident (français).
    `severity` : CRITICAL (accident/blessure/vol), HIGH (retard +2h, colis
    endommagé, sécurité), MEDIUM (retard mineur, client absent, accès),
    LOW (note informative). La notification dispatcher est créée
    automatiquement pour CRITICAL/HIGH.
    """
    return await persist_incident(
        text=summary,
        driver_id=driver_id,
        severity=severity,
        summary=summary,
        delivery_id=delivery_id,
    )


@mcp.tool()
async def create_delivery_event(
    delivery_id: str,
    description: str,
    severity: Severity,
    driver_id: str | None = None,
) -> dict:
    """Enregistre un événement (incident) sur une livraison précise.

    À appeler quand l'incident concerne une livraison identifiée. La sévérité
    est convertie en type/statut d'événement côté livraison.
    """
    type_map = {"CRITICAL": "critical", "HIGH": "warning", "MEDIUM": "info", "LOW": "note"}
    status = "waiting" if severity in ("CRITICAL", "HIGH") else "information"
    return await _create_event(
        delivery_id=delivery_id,
        description=description,
        event_type=type_map.get(severity, "note"),
        status=status,
        driver_id=driver_id,
    )


@mcp.tool()
async def search_knowledge(query: str) -> dict:
    """Recherche dans la base de connaissances logistique (procédures, FAQ).

    À utiliser pour répondre aux questions générales/procédurales du chauffeur.
    """
    results = await _search_knowledge(query)
    return {"results": results}


if __name__ == "__main__":
    mcp.run()
