using System.Text.Json;

namespace ResearchLms.AiServices.Infrastructure.Services.Mcp.Tools;

public static class GetInstrumentStatusTool
{
    public static McpToolDefinition Create()
    {
        var schema = JsonDocument.Parse("""
        {
            "type": "object",
            "properties": {
                "instrumentId": { "type": "string", "description": "Instrument ID to check status for" }
            },
            "required": ["instrumentId"]
        }
        """).RootElement;

        return new McpToolDefinition(
            "GetInstrumentStatus",
            "Get current operational status of a laboratory instrument",
            schema,
            async (input) =>
            {
                await Task.CompletedTask;
                var id = input.TryGetProperty("instrumentId", out var idProp) ? idProp.GetString() : "unknown";
                return JsonSerializer.SerializeToElement(new
                {
                    instrumentId = id,
                    status = "Available",
                    temperature = 23.5,
                    pressure = 1.02,
                    lastCalibration = "2026-05-15",
                    nextMaintenance = "2026-08-20",
                    isOnline = true,
                    location = "Lab A - Room 102"
                });
            }
        );
    }
}
