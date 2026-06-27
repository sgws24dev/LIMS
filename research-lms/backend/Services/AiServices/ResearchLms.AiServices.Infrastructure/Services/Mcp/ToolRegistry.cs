using System.Text.Json;

namespace ResearchLms.AiServices.Infrastructure.Services.Mcp;

public record McpToolDefinition(
    string Name,
    string Description,
    JsonElement InputSchema,
    Func<JsonElement, Task<JsonElement>> Handler
);

public class ToolRegistry
{
    private readonly Dictionary<string, McpToolDefinition> _tools = new();

    public void Register(McpToolDefinition tool)
    {
        _tools[tool.Name] = tool;
    }

    public IReadOnlyList<McpToolDefinition> GetAll() => _tools.Values.ToList();

    public McpToolDefinition? Get(string name) =>
        _tools.TryGetValue(name, out var tool) ? tool : null;
}
