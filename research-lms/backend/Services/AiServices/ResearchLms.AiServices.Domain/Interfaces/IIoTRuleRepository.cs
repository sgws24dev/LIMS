using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IIoTRuleRepository
{
    Task<IReadOnlyList<IoTRule>> GetByTenantAsync(Guid tenantId, Guid? instrumentId = null, CancellationToken ct = default);
    Task<IoTRule?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(IoTRule rule, CancellationToken ct = default);
    Task UpdateAsync(IoTRule rule, CancellationToken ct = default);
    Task DeleteAsync(IoTRule rule, CancellationToken ct = default);
}
