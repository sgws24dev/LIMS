namespace ResearchLms.AiServices.Domain.ValueObjects;

public record ActionPlan(
    string Intent,
    string ParametersJson,
    double Confidence,
    string? SuggestedTool,
    string DryRunPreview,
    bool RequiresApproval
);

public record GuardrailResult(
    bool IsAllowed,
    string? BlockedReason,
    bool RequiresApproval,
    string[] ApproverRoles
);
