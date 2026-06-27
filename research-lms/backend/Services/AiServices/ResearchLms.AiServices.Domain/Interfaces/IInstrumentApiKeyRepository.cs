using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IInstrumentApiKeyRepository
{
    Task<IReadOnlyList<InstrumentApiKey>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default);
    Task<InstrumentApiKey?> GetByKeyHashAsync(string keyHash, CancellationToken ct = default);
    Task<InstrumentApiKey?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(InstrumentApiKey key, CancellationToken ct = default);
    Task UpdateAsync(InstrumentApiKey key, CancellationToken ct = default);
}
