using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Domain.Entities;

public class ActionLog : BaseEntity
{
    public Guid UserId { get; private set; }
    public string Utterance { get; private set; } = string.Empty;
    public string Intent { get; private set; } = string.Empty;
    public string ParametersJson { get; private set; } = "{}";
    public string Status { get; private set; } = "Pending";
    public string? GuardrailResultJson { get; private set; }
    public string? ExecutionResultJson { get; private set; }
    public long DurationMs { get; private set; }

    protected ActionLog() { }

    public ActionLog(Guid userId, string utterance, string intent, string parametersJson)
    {
        UserId = userId;
        Utterance = utterance;
        Intent = intent;
        ParametersJson = parametersJson;
        Status = "Pending";
    }

    public void MarkCompleted(string executionResult, long durationMs)
    {
        Status = "Completed";
        ExecutionResultJson = executionResult;
        DurationMs = durationMs;
    }

    public void MarkBlocked(string guardrailResult, long durationMs)
    {
        Status = "Blocked";
        GuardrailResultJson = guardrailResult;
        DurationMs = durationMs;
    }

    public void MarkFailed(string error, long durationMs)
    {
        Status = "Failed";
        ExecutionResultJson = error;
        DurationMs = durationMs;
    }
}
