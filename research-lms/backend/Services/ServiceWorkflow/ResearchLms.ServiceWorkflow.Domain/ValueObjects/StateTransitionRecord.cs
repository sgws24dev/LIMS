namespace ResearchLms.ServiceWorkflow.Domain.ValueObjects;

public record StateTransitionRecord(
    string FromState,
    string ToState,
    string Trigger,
    string TriggeredBy,
    DateTime TriggeredAt,
    string? Comment
);
