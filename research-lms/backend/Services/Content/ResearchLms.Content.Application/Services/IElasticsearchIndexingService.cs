using ResearchLms.Content.Domain.Entities;

namespace ResearchLms.Content.Application.Services;

public interface IElasticsearchIndexingService
{
    Task IndexHelpArticleAsync(HelpArticle article, CancellationToken ct = default);
    Task RemoveHelpArticleAsync(Guid id, CancellationToken ct = default);
}