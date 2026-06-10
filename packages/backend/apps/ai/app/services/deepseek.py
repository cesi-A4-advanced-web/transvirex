from openai import AsyncOpenAI
from ..config import settings

_client: AsyncOpenAI | None = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url,
        )
    return _client


async def chat_completion(
    messages: list[dict],
    system: str | None = None,
) -> str:
    all_messages = []
    if system:
        all_messages.append({"role": "system", "content": system})
    all_messages.extend(messages)

    response = await get_client().chat.completions.create(
        model=settings.deepseek_chat_model,
        messages=all_messages,
    )
    return response.choices[0].message.content or ""
