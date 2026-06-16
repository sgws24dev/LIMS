using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.ValueObjects;

namespace ResearchLms.ServiceWorkflow.Domain.Interfaces;

public interface IWorkflowAction
{
    string Name { get; }
    Task ExecuteAsync(
        WorkflowInstance instance,
        StateTransitionRecord transition,
        Dictionary<string, object> context,
        CancellationToken ct = default);
}
