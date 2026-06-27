using ResearchLms.Content.Domain.Entities;

namespace ResearchLms.Content.Domain.Interfaces;

public interface IHelpArticleRepository
{
    Task<IReadOnlyList<HelpArticle>> SearchAsync(Guid tenantId, string? searchTerm = null, Guid? categoryId = null, List<string>? tags = null, bool? publishedOnly = null, CancellationToken ct = default);
    Task<HelpArticle?> GetBySlugAsync(Guid tenantId, string slug, CancellationToken ct = default);
    Task<HelpArticle?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(HelpArticle article, CancellationToken ct = default);
    Task UpdateAsync(HelpArticle article, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task IncrementViewCountAsync(Guid id, CancellationToken ct = default);
}
