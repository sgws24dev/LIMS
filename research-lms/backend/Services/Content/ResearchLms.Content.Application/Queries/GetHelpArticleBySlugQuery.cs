using MediatR;
using Microsoft.Extensions.Caching.Memory;
using ResearchLms.Content.Application.DTOs;
using ResearchLms.Content.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Content.Application.Queries;

public record GetHelpArticleBySlugQuery(string Slug) : IRequest<HelpArticleDto?>;

public class GetHelpArticleBySlugQueryHandler : IRequestHandler<GetHelpArticleBySlugQuery, HelpArticleDto?>
{
    private readonly IHelpArticleRepository _repository;
    private readonly ITenantContext _tenantContext;
    private readonly IMemoryCache _cache;
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(30);

    public GetHelpArticleBySlugQueryHandler(
        IHelpArticleRepository repository,
        ITenantContext tenantContext,
        IMemoryCache cache)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _cache = cache;
    }

    public async Task<HelpArticleDto?> Handle(GetHelpArticleBySlugQuery request, CancellationToken ct)
    {
        var cacheKey = $"help_article:{_tenantContext.TenantId}:{request.Slug}";

        if (_cache.TryGetValue(cacheKey, out HelpArticleDto? cached))
            return cached;

        var article = await _repository.GetBySlugAsync(_tenantContext.TenantId, request.Slug, ct);
        if (article == null) return null;

        await _repository.IncrementViewCountAsync(article.Id, ct);

        var dto = new HelpArticleDto(
            article.Id, article.Title, article.Slug, article.Content, article.CategoryId,
            article.GetTags(), article.IsPublished, article.ViewCount + 1, article.CreatedAt
        );

        _cache.Set(cacheKey, dto, CacheTtl);
        return dto;
    }
}
