namespace ResearchLms.ServiceWorkflow.Domain.ValueObjects;

public record WorkflowTransitionDefinition(
    string FromState,
    string ToState,
    string Trigger,
    IReadOnlyList<string> Guards,
    IReadOnlyList<string> Actions
);
