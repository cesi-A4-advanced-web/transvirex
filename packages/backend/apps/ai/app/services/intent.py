from .deepseek import chat_completion

_INTENT_PROMPT = """Tu es un classificateur d'intention pour un assistant logistique.
Réponds UNIQUEMENT par "incident" ou "chat", rien d'autre.

- "incident" : le chauffeur déclare un problème concret (accident, colis endommagé/perdu, retard, client absent, véhicule en panne, problème de sécurité, etc.)
- "chat" : question générale, demande d'information, aide procédurale

Message du chauffeur : {text}"""


async def detect_intent(text: str) -> str:
    result = await chat_completion(
        [{"role": "user", "content": _INTENT_PROMPT.format(text=text)}]
    )
    return "incident" if "incident" in result.strip().lower() else "chat"
