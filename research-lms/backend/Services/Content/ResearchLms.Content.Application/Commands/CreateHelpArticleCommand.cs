using MediatR;
using Microsoft.Extensions.Caching.Memory;
using ResearchLms.Content.Domain.Entities;
using ResearchLms.Content.Domain.Interfaces;
using ResearchLms.Content.Application.Services;

namespace ResearchLms.Content.Application.Commands;

public record CreateHelpArticleCommand(
    string Title,
    string Content,
    Guid CategoryId,
    string[] Tags,
    bool IsPublished
) : IRequest<Guid>;

public class CreateHelpArticleCommandHandler : IRequestHandler<CreateHelpArticleCommand, Guid>
{
    private readonly IHelpArticleRepository _repository;
    private readonly IElasticsearchIndexingService _elasticsearch;
    private readonly IMemoryCache _cache;

    public CreateHelpArticleCommandHandler(
        IHelpArticleRepository repository,
        IElasticsearchIndexingService elasticsearch,
        IMemoryCache cache)
    {
        _repository = repository;
        _elasticsearch = elasticsearch;
        _cache = cache;
    }

    public async Task<Guid> Handle(CreateHelpArticleCommand request, CancellationToken ct)
    {
        var slug = request.Title.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("--", "-")
            .Trim('-');

        var article = new HelpArticle(
            request.Title, slug, request.Content,
            request.CategoryId, request.Tags, request.IsPublished);

        await _repository.AddAsync(article, ct);

        await _elasticsearch.IndexHelpArticleAsync(article, ct);

        _cache.Remove($"help_article:*:{slug}");

        return article.Id;
    }
}
