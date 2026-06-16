using Microsoft.Extensions.Logging;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Domain.ValueObjects;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Services.Actions;

public class LogTransitionAction : IWorkflowAction
{
    private readonly ILogger<LogTransitionAction> _logger;

    public LogTransitionAction(ILogger<LogTransitionAction> logger)
    {
        _logger = logger;
    }

    public string Name => "LogTransition";

    public Task ExecuteAsync(
        WorkflowInstance instance,
        StateTransitionRecord transition,
        Dictionary<string, object> context,
        CancellationToken ct = default)
    {
        _logger.LogInformation(
            "Workflow {InstanceId} transitioned {From} → {To} via {Trigger} by {User}",
            instance.Id,
            transition.FromState,
            transition.ToState,
            transition.Trigger,
            transition.TriggeredBy);

        return Task.CompletedTask;
    }
}
