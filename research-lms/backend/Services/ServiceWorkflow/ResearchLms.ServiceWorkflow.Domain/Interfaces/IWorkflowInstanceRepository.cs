using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Domain.Interfaces;

public interface IWorkflowInstanceRepository
{
    Task<WorkflowInstance?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<WorkflowInstance?> GetByEntityAsync(string entityType, Guid entityId, CancellationToken ct = default);
    Task AddAsync(WorkflowInstance instance, CancellationToken ct = default);
    Task UpdateAsync(WorkflowInstance instance, CancellationToken ct = default);
}
