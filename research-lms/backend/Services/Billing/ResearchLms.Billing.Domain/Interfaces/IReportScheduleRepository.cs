using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IReportScheduleRepository
{
    Task<List<ReportSchedule>> GetAllAsync(CancellationToken ct = default);
    Task<ReportSchedule?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<ReportSchedule>> GetByReportDefinitionIdAsync(Guid reportDefinitionId, CancellationToken ct = default);
    Task AddAsync(ReportSchedule schedule, CancellationToken ct = default);
    Task UpdateAsync(ReportSchedule schedule, CancellationToken ct = default);
    Task DeleteAsync(ReportSchedule schedule, CancellationToken ct = default);
}
