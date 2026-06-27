using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IAutomationActionLogRepository
{
    Task<IReadOnlyList<AutomationActionLog>> GetPendingByTenantAsync(Guid tenantId, CancellationToken ct = default);
    Task<AutomationActionLog?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(AutomationActionLog log, CancellationToken ct = default);
    Task UpdateAsync(AutomationActionLog log, CancellationToken ct = default);
}
