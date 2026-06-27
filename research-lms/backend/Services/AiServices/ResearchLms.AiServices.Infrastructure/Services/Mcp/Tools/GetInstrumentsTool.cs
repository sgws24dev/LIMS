using System.Text.Json;

namespace ResearchLms.AiServices.Infrastructure.Services.Mcp.Tools;

public static class GetInstrumentsTool
{
    public static McpToolDefinition Create()
    {
        var schema = JsonDocument.Parse("""
        {
            "type": "object",
            "properties": {},
            "required": []
        }
        """).RootElement;

        return new McpToolDefinition(
            "GetInstruments",
            "List all instruments available in the facility",
            schema,
            async (input) =>
            {
                await Task.CompletedTask;
                return JsonSerializer.SerializeToElement(new
                {
                    instruments = new[]
                    {
                        new { id = "mock-instrument-1", name = "Mass Spectrometer", status = "Available" },
                        new { id = "mock-instrument-2", name = "PCR Machine", status = "In Use" },
                        new { id = "mock-instrument-3", name = "Centrifuge", status = "Maintenance" }
                    }
                });
            }
        );
    }
}
