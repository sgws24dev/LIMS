using System.Text.Json;

namespace ResearchLms.AiServices.Infrastructure.Services.Mcp.Tools;

public static class SearchHelpArticlesTool
{
    public static McpToolDefinition Create()
    {
        var schema = JsonDocument.Parse("""
        {
            "type": "object",
            "properties": {
                "query": { "type": "string", "description": "Search query" },
                "maxResults": { "type": "integer", "description": "Max results to return" }
            },
            "required": ["query"]
        }
        """).RootElement;

        return new McpToolDefinition(
            "SearchHelpArticles",
            "Search help articles and documentation",
            schema,
            async (input) =>
            {
                await Task.CompletedTask;
                return JsonSerializer.SerializeToElement(new
                {
                    results = new[]
                    {
                        new { title = "How to book an instrument", slug = "book-instrument", relevance = 0.95 },
                        new { title = "Safety guidelines for lab equipment", slug = "safety-guidelines", relevance = 0.82 }
                    }
                });
            }
        );
    }
}
