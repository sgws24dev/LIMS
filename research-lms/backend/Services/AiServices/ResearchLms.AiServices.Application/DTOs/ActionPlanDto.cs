namespace ResearchLms.AiServices.Application.DTOs;

public record ActionPlanDto(
    string Intent,
    string ParametersJson,
    double Confidence,
    string? SuggestedTool,
    string DryRunPreview,
    bool RequiresApproval,
    GuardrailResultDto Guardrail
);

public record GuardrailResultDto(
    bool IsAllowed,
    string? BlockedReason,
    bool RequiresApproval,
    string[] ApproverRoles
);

public record ActionLogEntryDto(
    Guid Id,
    Guid UserId,
    string Utterance,
    string Intent,
    string Status,
    string? GuardrailResult,
    string? ExecutionResult,
    long DurationMs,
    DateTime CreatedAt
);

public record DryRunRequest(string Utterance);

public record ExecuteActionRequest(string Utterance);
