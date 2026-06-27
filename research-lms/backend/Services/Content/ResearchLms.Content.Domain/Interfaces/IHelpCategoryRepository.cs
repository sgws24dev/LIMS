using ResearchLms.Content.Domain.Entities;

namespace ResearchLms.Content.Domain.Interfaces;

public interface IHelpCategoryRepository
{
    Task<IReadOnlyList<HelpCategory>> GetAllAsync(Guid tenantId, CancellationToken ct = default);
    Task<HelpCategory?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<HelpCategory?> GetBySlugAsync(Guid tenantId, string slug, CancellationToken ct = default);
    Task AddAsync(HelpCategory category, CancellationToken ct = default);
    Task UpdateAsync(HelpCategory category, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
