"""Agentic assistant: DeepSeek drives the MCP tools in a tool-calling loop."""
import json

from .mcp.host import host
from .services.deepseek import chat_with_tools
from .services.rag import rag_chat

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


async def run_agent(text: str, driver_id: str, delivery_id: str | None = None) -> dict:
    tools = await host.list_openai_tools()
    if not tools:
        # MCP host unavailable: degrade to a plain knowledge-grounded answer.
        answer = await rag_chat(text)
        return {"type": "chat", "answer": answer, "incident": None}

    system = _SYSTEM_PROMPT.format(
        driver_id=driver_id, delivery_id=delivery_id or "(aucun — à déterminer)"
    )
    messages: list[dict] = [
        {"role": "system", "content": system},
        {"role": "user", "content": text},
    ]

    incident: dict | None = None

    for _ in range(_MAX_ITERATIONS):
        message = await chat_with_tools(messages, tools)
        tool_calls = getattr(message, "tool_calls", None)

        if not tool_calls:
            return {"type": "incident" if incident else "chat",
                    "answer": message.content or "", "incident": incident}

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

            result = await host.call_tool(tc.function.name, args)

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
