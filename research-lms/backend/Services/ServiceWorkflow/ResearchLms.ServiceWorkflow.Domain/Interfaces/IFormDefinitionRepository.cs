using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Domain.Interfaces;

public interface IFormDefinitionRepository
{
    Task<FormDefinition?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<FormDefinition>> GetAllAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<FormDefinition>> GetPublishedAsync(Guid tenantId, CancellationToken ct = default);
    Task AddAsync(FormDefinition form, CancellationToken ct = default);
    Task UpdateAsync(FormDefinition form, CancellationToken ct = default);
    Task DeleteAsync(FormDefinition form, CancellationToken ct = default);
    Task<bool> HasActiveRequestsAsync(Guid formDefinitionId, CancellationToken ct = default);
}
