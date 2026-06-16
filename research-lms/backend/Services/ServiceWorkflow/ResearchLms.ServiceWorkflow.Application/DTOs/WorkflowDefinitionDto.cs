namespace ResearchLms.ServiceWorkflow.Application.DTOs;

public record WorkflowDefinitionDto(
    Guid Id,
    string Name,
    string? Description,
    string States,
    string Transitions,
    bool IsPublished,
    int Version,
    string? EntityTypeHint,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy);

public record WorkflowStateDefinitionDto(
    string Name,
    string Label,
    string Type,
    List<string>? AllowedTriggers);

public record WorkflowTransitionDefinitionDto(
    string FromState,
    string ToState,
    string Trigger,
    string? Label,
    List<string> Guards,
    List<string> Actions);
