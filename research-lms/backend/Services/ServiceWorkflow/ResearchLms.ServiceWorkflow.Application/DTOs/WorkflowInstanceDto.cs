using ResearchLms.ServiceWorkflow.Domain.ValueObjects;

namespace ResearchLms.ServiceWorkflow.Application.DTOs;

public record WorkflowInstanceDto(
    Guid Id,
    Guid WorkflowDefinitionId,
    string EntityType,
    Guid EntityId,
    string CurrentState,
    string Status,
    List<StateTransitionRecord> StateHistory,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy);

public record AvailableTriggerDto(
    string Trigger,
    string ToState);
