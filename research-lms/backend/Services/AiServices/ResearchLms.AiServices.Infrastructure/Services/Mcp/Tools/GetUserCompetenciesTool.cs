using System.Text.Json;

namespace ResearchLms.AiServices.Infrastructure.Services.Mcp.Tools;

public static class GetUserCompetenciesTool
{
    public static McpToolDefinition Create()
    {
        var schema = JsonDocument.Parse("""
        {
            "type": "object",
            "properties": {
                "userId": { "type": "string", "description": "User ID to check competencies for (optional)" }
            },
            "required": []
        }
        """).RootElement;

        return new McpToolDefinition(
            "GetUserCompetencies",
            "Retrieve competency and training status for a user",
            schema,
            async (input) =>
            {
                await Task.CompletedTask;
                var competencies = new List<object>
                {
                    new { name = "Mass Spectrometry Operations", status = "Certified", expiry = "2026-12-31", progress = 1.0 },
                    new { name = "HPLC Safety Training", status = "InProgress", expiry = "", progress = 0.65 },
                    new { name = "Centrifuge Handling", status = "Expired", expiry = "2025-01-15", progress = 0.0 },
                    new { name = "Chemical Waste Disposal", status = "Certified", expiry = "2027-06-30", progress = 1.0 }
                };

                return JsonSerializer.SerializeToElement(new { competencies });
            }
        );
    }
}
