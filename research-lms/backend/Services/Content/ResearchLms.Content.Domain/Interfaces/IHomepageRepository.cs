using ResearchLms.Content.Domain.Entities;

namespace ResearchLms.Content.Domain.Interfaces;

public interface IHomepageRepository
{
    Task<HomepageDefinition?> GetActiveAsync(Guid tenantId, CancellationToken ct = default);
    Task<HomepageDefinition?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task UpsertAsync(HomepageDefinition homepage, CancellationToken ct = default);
    Task<IReadOnlyList<HomepageDefinition>> GetAllAsync(Guid tenantId, CancellationToken ct = default);
}
