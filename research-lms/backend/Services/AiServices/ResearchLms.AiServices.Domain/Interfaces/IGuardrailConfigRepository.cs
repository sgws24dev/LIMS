using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IGuardrailConfigRepository
{
    Task<GuardrailConfig?> GetByActionTypeAsync(Guid tenantId, string actionType, CancellationToken ct = default);
    Task<IReadOnlyList<GuardrailConfig>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default);
    Task AddAsync(GuardrailConfig config, CancellationToken ct = default);
    Task UpdateAsync(GuardrailConfig config, CancellationToken ct = default);
}
