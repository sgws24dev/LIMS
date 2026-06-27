using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IDashboardRepository
{
    Task<DashboardDefinition?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<DashboardDefinition>> GetAllAsync(Guid tenantId, CancellationToken ct = default);
    Task AddAsync(DashboardDefinition dashboard, CancellationToken ct = default);
    Task UpdateAsync(DashboardDefinition dashboard, CancellationToken ct = default);
    Task DeleteAsync(DashboardDefinition dashboard, CancellationToken ct = default);
}
