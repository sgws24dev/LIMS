using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Domain.Entities;

public class McpToolLog : BaseEntity
{
    public string ToolName { get; private set; } = string.Empty;
    public string InputJson { get; private set; } = "{}";
    public string ResultJson { get; private set; } = "{}";
    public Guid ExecutedByUserId { get; private set; }
    public long DurationMs { get; private set; }
    public bool IsError { get; private set; }

    protected McpToolLog() { }

    public McpToolLog(string toolName, string inputJson, string resultJson, Guid executedByUserId, long durationMs, bool isError)
    {
        ToolName = toolName;
        InputJson = inputJson;
        ResultJson = resultJson;
        ExecutedByUserId = executedByUserId;
        DurationMs = durationMs;
        IsError = isError;
    }
}
