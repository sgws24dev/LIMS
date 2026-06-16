using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Domain.Interfaces;

public interface IWorkflowDefinitionRepository
{
    Task<WorkflowDefinition?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<WorkflowDefinition>> GetAllAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<WorkflowDefinition>> GetPublishedByEntityHintAsync(string? entityTypeHint, CancellationToken ct = default);
    Task AddAsync(WorkflowDefinition definition, CancellationToken ct = default);
    Task UpdateAsync(WorkflowDefinition definition, CancellationToken ct = default);
    Task<bool> HasActiveInstancesAsync(Guid definitionId, CancellationToken ct = default);
}
