using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IAutomationRuleRepository
{
    Task<IReadOnlyList<AutomationRule>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default);
    Task<AutomationRule?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(AutomationRule rule, CancellationToken ct = default);
    Task UpdateAsync(AutomationRule rule, CancellationToken ct = default);
    Task DeleteAsync(AutomationRule rule, CancellationToken ct = default);
}
