"""MCP host: connect to the local MCP server (stdio) for one agent run.

The session is opened *per request*, inside the same task that runs the agent
loop. Keeping a stdio ClientSession alive across the FastAPI lifespan boundary
fails with anyio.ClosedResourceError (the streams are bound to the task that
created them), so we deliberately scope the session to a single agent run.
"""
import os
from contextlib import asynccontextmanager

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Pass the full environment through: with env=None the MCP SDK strips custom
# vars (DEEPSEEK_API_KEY, MONGODB_*, DELIVERY_SERVICE_URL), so the server's
# Settings() would fail to load and the subprocess would die ("Connection closed").
_PARAMS = StdioServerParameters(
    command="python",
    args=["-m", "app.mcp.server"],
    env=dict(os.environ),
)


@asynccontextmanager
async def mcp_session():
    """Open an initialized MCP client session for the duration of the block."""
    async with stdio_client(_PARAMS) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            yield session


def to_openai_tools(mcp_tools) -> list[dict]:
    """Convert MCP tool definitions to OpenAI/DeepSeek tool specs."""
    return [
        {
            "type": "function",
            "function": {
                "name": t.name,
                "description": t.description or "",
                "parameters": t.inputSchema,
            },
        }
        for t in mcp_tools
    ]


async def call_tool_text(session: ClientSession, name: str, arguments: dict) -> str:
    """Call an MCP tool and return its result as a JSON/text string."""
    result = await session.call_tool(name, arguments)
    parts = [getattr(c, "text", "") for c in result.content if getattr(c, "text", None)]
    return "\n".join(parts) if parts else "{}"
