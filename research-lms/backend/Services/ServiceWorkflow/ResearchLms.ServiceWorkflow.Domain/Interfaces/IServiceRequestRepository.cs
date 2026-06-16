using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Domain.Interfaces;

public interface IServiceRequestRepository
{
    Task<ServiceRequest?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<ServiceRequest>> GetAllAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<ServiceRequest>> GetByFormDefinitionIdAsync(Guid formDefinitionId, CancellationToken ct = default);
    Task<IReadOnlyList<ServiceRequest>> GetByAssigneeAsync(string userId, CancellationToken ct = default);
    Task<IReadOnlyList<ServiceRequest>> GetBySubmitterAsync(string userId, CancellationToken ct = default);
    Task AddAsync(ServiceRequest request, CancellationToken ct = default);
    Task UpdateAsync(ServiceRequest request, CancellationToken ct = default);
    Task<int> GetActiveRequestCountAsync(Guid formDefinitionId, CancellationToken ct = default);
}
