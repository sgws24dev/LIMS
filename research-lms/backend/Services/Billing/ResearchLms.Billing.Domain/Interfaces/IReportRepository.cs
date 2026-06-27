using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IReportRepository
{
    Task<ReportDefinition?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<ReportDefinition>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default);
    Task AddAsync(ReportDefinition report, CancellationToken ct = default);
    Task UpdateAsync(ReportDefinition report, CancellationToken ct = default);
    Task DeleteAsync(ReportDefinition report, CancellationToken ct = default);
}
