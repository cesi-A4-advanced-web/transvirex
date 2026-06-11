"""Agentic assistant: DeepSeek drives the MCP tools in a tool-calling loop."""
import json
import logging

from .mcp.host import call_tool_text, mcp_session, to_openai_tools
from .services.deepseek import chat_with_tools
from .services.rag import rag_chat

logger = logging.getLogger("uvicorn.error")

_MAX_ITERATIONS = 6

_SYSTEM_PROMPT = """Tu es l'assistant des chauffeurs-livreurs de Transvirex.

Tu disposes d'outils pour agir sur l'application. Règles :
- Si le chauffeur signale un PROBLÈME concret (accident, bouchon, retard, colis
  endommagé, client absent, panne, sécurité...) :
  1. Identifie la livraison concernée. Si tu n'as pas d'identifiant de livraison
     fiable, appelle `list_driver_deliveries` et déduis-la du contexte
     (nom du client, adresse...). N'invente jamais un identifiant.
  2. Si une livraison est identifiée, appelle `create_delivery_event`.
  3. Appelle `create_dispatcher_notification` avec un résumé clair en une phrase
     et la bonne sévérité (CRITICAL/HIGH/MEDIUM/LOW).
- Si c'est une QUESTION générale/procédurale, utilise `search_knowledge` puis réponds.
- Réponds toujours en français, brièvement, en confirmant l'action faite au chauffeur.

Contexte de la session :
- driver_id (User id du chauffeur) : {driver_id}
- delivery_id fourni par l'app : {delivery_id}
Utilise toujours ce driver_id dans les appels d'outils."""


async def run_agent(
    text: str,
    driver_id: str,
    delivery_id: str | None = None,
    history: list[dict] | None = None,
) -> dict:
    try:
        async with mcp_session() as session:
            return await _run_loop(session, text, driver_id, delivery_id, history)
    except Exception:
        logger.exception("Agent run failed — falling back to plain chat")
        answer = await rag_chat(text)
        return {"type": "chat", "answer": answer, "incident": None}


def _sanitize_history(history: list[dict] | None) -> list[dict]:
    """Keep only the last user/assistant turns with non-empty text content."""
    if not history:
        return []
    cleaned: list[dict] = []
    for item in history[-10:]:
        role = item.get("role")
        content = item.get("content")
        if role in ("user", "assistant") and isinstance(content, str) and content.strip():
            cleaned.append({"role": role, "content": content})
    return cleaned


async def _run_loop(
    session,
    text: str,
    driver_id: str,
    delivery_id: str | None,
    history: list[dict] | None = None,
) -> dict:
    tools_result = await session.list_tools()
    tools = to_openai_tools(tools_result.tools)

    system = _SYSTEM_PROMPT.format(
        driver_id=driver_id, delivery_id=delivery_id or "(aucun — à déterminer)"
    )
    messages: list[dict] = [
        {"role": "system", "content": system},
        *_sanitize_history(history),
        {"role": "user", "content": text},
    ]

    incident: dict | None = None

    for _ in range(_MAX_ITERATIONS):
        message = await chat_with_tools(messages, tools)
        tool_calls = getattr(message, "tool_calls", None)

        if not tool_calls:
            return {
                "type": "incident" if incident else "chat",
                "answer": message.content or "",
                "incident": incident,
            }

        # Record the assistant turn (with its tool calls) before answering them.
        messages.append({
            "role": "assistant",
            "content": message.content or "",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {"name": tc.function.name, "arguments": tc.function.arguments},
                }
                for tc in tool_calls
            ],
        })

        for tc in tool_calls:
            try:
                args = json.loads(tc.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}
            args.setdefault("driver_id", driver_id)

            result = await call_tool_text(session, tc.function.name, args)

            if tc.function.name == "create_dispatcher_notification":
                try:
                    parsed = json.loads(result)
                    if parsed.get("notified"):
                        incident = {
                            "id": parsed.get("id", ""),
                            "severity": parsed.get("severity", "MEDIUM"),
                            "summary": parsed.get("summary", ""),
                            "notified": True,
                        }
                except (json.JSONDecodeError, AttributeError):
                    pass

            messages.append({"role": "tool", "tool_call_id": tc.id, "content": result})

    # Safety net: hit the iteration cap.
    return {
        "type": "incident" if incident else "chat",
        "answer": "J'ai bien pris en compte votre message.",
        "incident": incident,
    }
