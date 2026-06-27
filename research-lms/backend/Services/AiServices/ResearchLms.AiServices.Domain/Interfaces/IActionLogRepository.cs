using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IActionLogRepository
{
    Task<IReadOnlyList<ActionLog>> GetByTenantAsync(Guid tenantId, Guid? userId = null, CancellationToken ct = default);
    Task<ActionLog?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(ActionLog log, CancellationToken ct = default);
    Task UpdateAsync(ActionLog log, CancellationToken ct = default);
}
