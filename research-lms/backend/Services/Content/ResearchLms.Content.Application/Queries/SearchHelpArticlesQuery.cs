using MediatR;
using ResearchLms.Content.Application.DTOs;
using ResearchLms.Content.Domain.Interfaces;

namespace ResearchLms.Content.Application.Queries;

public record SearchHelpArticlesQuery(
    string? SearchTerm = null,
    Guid? CategoryId = null,
    List<string>? Tags = null,
    bool? PublishedOnly = null
) : IRequest<IReadOnlyList<HelpArticleDto>>;

public class SearchHelpArticlesQueryHandler : IRequestHandler<SearchHelpArticlesQuery, IReadOnlyList<HelpArticleDto>>
{
    private readonly IHelpArticleRepository _repository;
    private readonly ResearchLms.Shared.Abstractions.ITenantContext _tenantContext;

    public SearchHelpArticlesQueryHandler(IHelpArticleRepository repository, ResearchLms.Shared.Abstractions.ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<IReadOnlyList<HelpArticleDto>> Handle(SearchHelpArticlesQuery request, CancellationToken ct)
    {
        var articles = await _repository.SearchAsync(
            _tenantContext.TenantId,
            request.SearchTerm,
            request.CategoryId,
            request.Tags,
            request.PublishedOnly,
            ct);

        return articles.Select(a => new HelpArticleDto(
            a.Id, a.Title, a.Slug, a.Content, a.CategoryId,
            a.GetTags(), a.IsPublished, a.ViewCount, a.CreatedAt
        )).ToList();
    }
}
