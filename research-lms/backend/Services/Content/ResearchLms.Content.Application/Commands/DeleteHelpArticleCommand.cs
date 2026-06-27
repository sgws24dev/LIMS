using MediatR;
using Microsoft.Extensions.Caching.Memory;
using ResearchLms.Content.Domain.Interfaces;
using ResearchLms.Content.Application.Services;

namespace ResearchLms.Content.Application.Commands;

public record DeleteHelpArticleCommand(Guid Id) : IRequest;

public class DeleteHelpArticleCommandHandler : IRequestHandler<DeleteHelpArticleCommand>
{
    private readonly IHelpArticleRepository _repository;
    private readonly IElasticsearchIndexingService _elasticsearch;
    private readonly IMemoryCache _cache;

    public DeleteHelpArticleCommandHandler(
        IHelpArticleRepository repository,
        IElasticsearchIndexingService elasticsearch,
        IMemoryCache cache)
    {
        _repository = repository;
        _elasticsearch = elasticsearch;
        _cache = cache;
    }

    public async Task Handle(DeleteHelpArticleCommand request, CancellationToken ct)
    {
        var article = await _repository.GetByIdAsync(request.Id, ct);
        if (article != null)
        {
            _cache.Remove($"help_article:*:{article.Slug}");
            await _elasticsearch.RemoveHelpArticleAsync(request.Id, ct);
        }
        await _repository.DeleteAsync(request.Id, ct);
    }
}
