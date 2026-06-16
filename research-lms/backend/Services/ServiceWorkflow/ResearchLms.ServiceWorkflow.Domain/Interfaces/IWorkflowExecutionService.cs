using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.ValueObjects;

namespace ResearchLms.ServiceWorkflow.Domain.Interfaces;

public interface IWorkflowExecutionService
{
    Task<WorkflowInstance> StartInstanceAsync(
        Guid workflowDefinitionId,
        string entityType,
        Guid entityId,
        Dictionary<string, object>? initialContext,
        CancellationToken ct = default);

    Task<TransitionResult> ExecuteTransitionAsync(
        Guid instanceId,
        string trigger,
        string? triggeredByName,
        string? comment,
        Dictionary<string, object>? additionalContext,
        CancellationToken ct = default);

    Task<IReadOnlyList<AvailableTrigger>> GetAvailableTriggersAsync(
        Guid instanceId,
        CancellationToken ct = default);

    Task<WorkflowInstance?> GetInstanceByEntityAsync(
        string entityType,
        Guid entityId,
        CancellationToken ct = default);
}

public record TransitionResult(
    bool IsSuccess,
    string? ErrorMessage,
    string? FromState,
    string? ToState,
    string? Trigger)
{
    public static TransitionResult Ok(string fromState, string toState, string trigger)
        => new(true, null, fromState, toState, trigger);

    public static TransitionResult Fail(string error)
        => new(false, error, null, null, null);

    public bool Success => IsSuccess;
}

public record AvailableTrigger(
    string Trigger,
    string ToState);
