using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Domain.Interfaces;

public interface INotificationDispatcher
{
    Task TryDispatchAsync(
        Guid workflowDefinitionId,
        string stateName,
        WorkflowInstance instance,
        CancellationToken ct = default);
}
