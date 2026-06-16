using System.Text.Json;
using Microsoft.Extensions.Logging;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Enums;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Domain.ValueObjects;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Services;

public class WorkflowExecutionService : IWorkflowExecutionService
{
    private readonly IWorkflowInstanceRepository _instanceRepo;
    private readonly IWorkflowDefinitionRepository _definitionRepo;
    private readonly IEnumerable<IWorkflowGuard> _guards;
    private readonly IEnumerable<IWorkflowAction> _actions;
    private readonly INotificationDispatcher _notificationDispatcher;
    private readonly ILogger<WorkflowExecutionService> _logger;

    public WorkflowExecutionService(
        IWorkflowInstanceRepository instanceRepo,
        IWorkflowDefinitionRepository definitionRepo,
        IEnumerable<IWorkflowGuard> guards,
        IEnumerable<IWorkflowAction> actions,
        INotificationDispatcher notificationDispatcher,
        ILogger<WorkflowExecutionService> logger)
    {
        _instanceRepo = instanceRepo;
        _definitionRepo = definitionRepo;
        _guards = guards;
        _actions = actions;
        _notificationDispatcher = notificationDispatcher;
        _logger = logger;
    }

    public async Task<WorkflowInstance> StartInstanceAsync(
        Guid workflowDefinitionId,
        string entityType,
        Guid entityId,
        Dictionary<string, object>? initialContext,
        CancellationToken ct = default)
    {
        var def = await _definitionRepo.GetByIdAsync(workflowDefinitionId, ct);
        if (def is null)
            throw new InvalidOperationException("Workflow definition not found.");

        var states = DeserializeStates(def.States);
        var initial = states.FirstOrDefault(s => s.Type == StateType.Initial);
        if (initial is null)
            throw new InvalidOperationException("No Initial state found in workflow definition.");

        var createdBy = initialContext?.GetValueOrDefault("UserId")?.ToString() ?? "system";
        var instance = new WorkflowInstance(workflowDefinitionId, entityType, entityId, initial.Name, createdBy);
        instance.ContextData = initialContext is not null ? JsonSerializer.Serialize(initialContext) : null;

        var record = new StateTransitionRecord(
            FromState: null!,
            ToState: initial.Name,
            Trigger: "__start__",
            TriggeredBy: createdBy,
            TriggeredAt: DateTime.UtcNow,
            Comment: null);

        instance.StateHistory = JsonSerializer.Serialize(
            new[] { record },
            new JsonSerializerOptions { WriteIndented = false });

        await _instanceRepo.AddAsync(instance, ct);

        _logger.LogInformation("Workflow {Id} started at state {State}", instance.Id, initial.Name);

        await _notificationDispatcher.TryDispatchAsync(def.Id, initial.Name, instance, ct);

        return instance;
    }

    public async Task<TransitionResult> ExecuteTransitionAsync(
        Guid instanceId,
        string trigger,
        string? triggeredByName,
        string? comment,
        Dictionary<string, object>? additionalContext,
        CancellationToken ct = default)
    {
        var instance = await _instanceRepo.GetByIdAsync(instanceId, ct);
        if (instance is null)
            return TransitionResult.Fail("Workflow instance not found.");

        if (instance.Status != WorkflowInstanceStatus.Active)
            return TransitionResult.Fail("Workflow is not active.");

        var def = instance.WorkflowDefinition;
        if (def is null)
            return TransitionResult.Fail("Workflow definition not found.");

        var transitions = DeserializeTransitions(def.Transitions);
        var valid = transitions.FirstOrDefault(t =>
            t.FromState == instance.CurrentState && t.Trigger == trigger);

        if (valid is null)
            return TransitionResult.Fail(
                $"No transition defined from '{instance.CurrentState}' via trigger '{trigger}'.");

        var context = additionalContext ?? new Dictionary<string, object>();
        foreach (var (key, value) in JsonSerializer.Deserialize<Dictionary<string, object>>(instance.ContextData ?? "{}") ?? new())
            context.TryAdd(key, value);

        var guardResults = await EvaluateGuardsAsync(instance, valid.Guards, context, ct);

        var failedGuard = guardResults.FirstOrDefault(g => !g.Passed);
        if (failedGuard is not null)
            return TransitionResult.Fail(
                $"Guard '{failedGuard.GuardName}' blocked transition: {failedGuard.FailureReason}");

        var record = new StateTransitionRecord(
            FromState: instance.CurrentState,
            ToState: valid.ToState,
            Trigger: trigger,
            TriggeredBy: triggeredByName ?? "system",
            TriggeredAt: DateTime.UtcNow,
            Comment: comment);

        instance.CurrentState = valid.ToState;
        instance.ContextData = JsonSerializer.Serialize(context);
        var userId = triggeredByName ?? "system";
        instance.MarkUpdated(userId);

        var history = DeserializeHistory(instance.StateHistory).ToList();
        history.Add(record);
        instance.StateHistory = JsonSerializer.Serialize(history, new JsonSerializerOptions { WriteIndented = false });

        var states = DeserializeStates(def.States);
        var targetState = states.FirstOrDefault(s => s.Name == valid.ToState);
        if (targetState?.Type is StateType.Final or StateType.Terminal)
            instance.Status = WorkflowInstanceStatus.Completed;

        await _instanceRepo.UpdateAsync(instance, ct);

        _logger.LogInformation("Workflow {Id} transitioned: {From} -> {To} via {Trigger}",
            instanceId, record.FromState, record.ToState, trigger);

        foreach (var actionName in valid.Actions)
        {
            var action = _actions.FirstOrDefault(a => a.Name == actionName);
            if (action is null)
            {
                _logger.LogWarning("Action '{Name}' not registered; skipping.", actionName);
                continue;
            }

            try
            {
                await action.ExecuteAsync(instance, record, context, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Action '{Name}' failed for workflow {Id}", actionName, instanceId);
            }
        }

        await _notificationDispatcher.TryDispatchAsync(def.Id, valid.ToState, instance, ct);

        var available = GetAvailableTriggers(states, transitions, valid.ToState, instance.Status);
        return TransitionResult.Ok(instance.CurrentState, valid.ToState, trigger);
    }

    public async Task<IReadOnlyList<AvailableTrigger>> GetAvailableTriggersAsync(
        Guid instanceId,
        CancellationToken ct = default)
    {
        var instance = await _instanceRepo.GetByIdAsync(instanceId, ct);
        if (instance is null || instance.WorkflowDefinition is null)
            return Array.Empty<AvailableTrigger>();

        var states = DeserializeStates(instance.WorkflowDefinition.States);
        var transitions = DeserializeTransitions(instance.WorkflowDefinition.Transitions);
        return GetAvailableTriggers(states, transitions, instance.CurrentState, instance.Status);
    }

    public async Task<WorkflowInstance?> GetInstanceByEntityAsync(
        string entityType,
        Guid entityId,
        CancellationToken ct = default)
        => await _instanceRepo.GetByEntityAsync(entityType, entityId, ct);

    private async Task<IReadOnlyList<GuardEvaluation>> EvaluateGuardsAsync(
        WorkflowInstance instance,
        IReadOnlyList<string> guardNames,
        Dictionary<string, object> context,
        CancellationToken ct)
    {
        var results = new List<GuardEvaluation>();

        foreach (var guardName in guardNames)
        {
            var guard = _guards.FirstOrDefault(g => g.Name == guardName);
            if (guard is null)
            {
                results.Add(new GuardEvaluation(guardName, true, null));
                continue;
            }

            var result = await guard.EvaluateAsync(instance, context, ct);
            results.Add(new GuardEvaluation(guardName, result.Passed, result.FailureReason));
        }

        return results;
    }

    private static IReadOnlyList<AvailableTrigger> GetAvailableTriggers(
        IReadOnlyList<WorkflowStateDefinition> states,
        IReadOnlyList<WorkflowTransitionDefinition> transitions,
        string currentState,
        WorkflowInstanceStatus status)
    {
        var currentStateDef = states.FirstOrDefault(s => s.Name == currentState);
        if (currentStateDef?.Type is StateType.Final or StateType.Terminal || status != WorkflowInstanceStatus.Active)
            return Array.Empty<AvailableTrigger>();

        return transitions
            .Where(t => t.FromState == currentState)
            .Select(t => new AvailableTrigger(t.Trigger, t.ToState))
            .Distinct()
            .ToList();
    }

    private static IReadOnlyList<WorkflowStateDefinition> DeserializeStates(string json)
        => JsonSerializer.Deserialize<List<WorkflowStateDefinition>>(json)
           ?? new List<WorkflowStateDefinition>();

    private static IReadOnlyList<WorkflowTransitionDefinition> DeserializeTransitions(string json)
        => JsonSerializer.Deserialize<List<WorkflowTransitionDefinition>>(json)
           ?? new List<WorkflowTransitionDefinition>();

    private static IReadOnlyList<StateTransitionRecord> DeserializeHistory(string json)
        => JsonSerializer.Deserialize<List<StateTransitionRecord>>(json)
           ?? new List<StateTransitionRecord>();
}

internal record GuardEvaluation(string GuardName, bool Passed, string? FailureReason);
