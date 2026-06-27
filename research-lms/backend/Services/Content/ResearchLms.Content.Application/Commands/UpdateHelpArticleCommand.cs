using MediatR;
using Microsoft.Extensions.Caching.Memory;
using ResearchLms.Content.Domain.Interfaces;
using ResearchLms.Content.Application.Services;

namespace ResearchLms.Content.Application.Commands;

public record UpdateHelpArticleCommand(
    Guid Id,
    string Title,
    string Content,
    Guid CategoryId,
    string[] Tags,
    bool IsPublished
) : IRequest;

public class UpdateHelpArticleCommandHandler : IRequestHandler<UpdateHelpArticleCommand>
{
    private readonly IHelpArticleRepository _repository;
    private readonly IElasticsearchIndexingService _elasticsearch;
    private readonly IMemoryCache _cache;

    public UpdateHelpArticleCommandHandler(
        IHelpArticleRepository repository,
        IElasticsearchIndexingService elasticsearch,
        IMemoryCache cache)
    {
        _repository = repository;
        _elasticsearch = elasticsearch;
        _cache = cache;
    }

    public async Task Handle(UpdateHelpArticleCommand request, CancellationToken ct)
    {
        var article = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Help article {request.Id} not found");

        var oldSlug = article.Slug;
        var slug = request.Title.ToLowerInvariant().Replace(" ", "-").Replace("--", "-").Trim('-');

        article.Update(request.Title, slug, request.Content, request.CategoryId, request.Tags, request.IsPublished);
        await _repository.UpdateAsync(article, ct);

        await _elasticsearch.IndexHelpArticleAsync(article, ct);

        _cache.Remove($"help_article:*:{oldSlug}");
        _cache.Remove($"help_article:*:{slug}");
    }
}
