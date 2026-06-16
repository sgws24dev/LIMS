using ResearchLms.ServiceWorkflow.Domain.Enums;

namespace ResearchLms.ServiceWorkflow.Domain.ValueObjects;

public record WorkflowStateDefinition(
    string Name,
    string Label,
    StateType Type
);
