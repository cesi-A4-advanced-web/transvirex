"""MCP host: persistent client session to the local MCP server (stdio).

The session is opened once at FastAPI startup and reused across requests.
It exposes the server's tools to the DeepSeek agent in OpenAI tool format.
"""
import json
from contextlib import AsyncExitStack

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


class MCPHost:
    def __init__(self) -> None:
        self.session: ClientSession | None = None
        self._stack: AsyncExitStack | None = None

    async def start(self) -> None:
        self._stack = AsyncExitStack()
        params = StdioServerParameters(command="python", args=["-m", "app.mcp.server"])
        read, write = await self._stack.enter_async_context(stdio_client(params))
        self.session = await self._stack.enter_async_context(ClientSession(read, write))
        await self.session.initialize()

    async def stop(self) -> None:
        if self._stack is not None:
            await self._stack.aclose()
        self.session = None
        self._stack = None

    async def list_openai_tools(self) -> list[dict]:
        """Fetch MCP tools and convert them to OpenAI/DeepSeek tool specs."""
        if self.session is None:
            return []
        result = await self.session.list_tools()
        return [
            {
                "type": "function",
                "function": {
                    "name": t.name,
                    "description": t.description or "",
                    "parameters": t.inputSchema,
                },
            }
            for t in result.tools
        ]

    async def call_tool(self, name: str, arguments: dict) -> str:
        """Call an MCP tool and return its result as a JSON/text string."""
        if self.session is None:
            return json.dumps({"error": "MCP indisponible"})
        result = await self.session.call_tool(name, arguments)
        parts = [getattr(c, "text", "") for c in result.content if getattr(c, "text", None)]
        return "\n".join(parts) if parts else "{}"


host = MCPHost()
