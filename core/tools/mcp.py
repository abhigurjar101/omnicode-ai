"""Model Context Protocol (MCP) Client and Registry for OMNICODE AI 5.0.

Provides standard JSON-RPC 2.0 tool definitions, registration, validation,
and execution conforming to the Model Context Protocol specification.
"""

from typing import Dict, Any, List, Optional, Callable
from pydantic import BaseModel, Field


class MCPToolParameter(BaseModel):
    name: str
    type: str
    description: str
    required: bool = True
    default: Optional[Any] = None


class MCPToolSchema(BaseModel):
    name: str
    description: str
    inputSchema: Dict[str, Any] = Field(default_factory=dict)


class MCPToolRegistry:
    """Manages MCP-compliant tools and their execution handlers."""

    def __init__(self):
        self._tools: Dict[str, MCPToolSchema] = {}
        self._handlers: Dict[str, Callable] = {}

    def register_tool(
        self,
        name: str,
        description: str,
        parameters: Dict[str, Any],
        handler: Callable,
    ) -> None:
        """Registers a tool with its JSON Schema parameter definition and callable handler."""
        schema = MCPToolSchema(
            name=name,
            description=description,
            inputSchema={
                "type": "object",
                "properties": parameters.get("properties", {}),
                "required": parameters.get("required", []),
            },
        )
        self._tools[name] = schema
        self._handlers[name] = handler

    def list_tools(self) -> List[Dict[str, Any]]:
        """Returns the list of registered tools conforming to MCP tools/list."""
        return [tool.model_dump() for tool in self._tools.values()]

    def get_tool(self, name: str) -> Optional[MCPToolSchema]:
        """Gets a tool definition by name."""
        return self._tools.get(name)

    async def call_tool(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Calls a registered tool handler with the given arguments."""
        if name not in self._handlers:
            return {
                "isError": True,
                "content": [{"type": "text", "text": f"Tool '{name}' not found."}],
            }

        handler = self._handlers[name]
        try:
            import inspect
            if inspect.iscoroutinefunction(handler):
                result = await handler(**arguments)
            else:
                result = handler(**arguments)

            text_output = str(result)
            return {
                "isError": False,
                "content": [{"type": "text", "text": text_output}],
                "structured": result if isinstance(result, dict) else {"output": result},
            }
        except Exception as e:
            return {
                "isError": True,
                "content": [{"type": "text", "text": f"Error executing tool '{name}': {str(e)}"}],
            }
