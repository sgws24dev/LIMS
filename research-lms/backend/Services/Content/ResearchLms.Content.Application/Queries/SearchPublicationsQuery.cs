using MediatR;
using ResearchLms.Content.Application.DTOs;
using ResearchLms.Content.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Content.Application.Queries;

public record SearchPublicationsQuery(
    string? SearchTerm = null,
    string? Type = null,
    string? Author = null,
    int? Year = null,
    string? Journal = null
) : IRequest<IReadOnlyList<PublicationDto>>;

public class SearchPublicationsQueryHandler : IRequestHandler<SearchPublicationsQuery, IReadOnlyList<PublicationDto>>
{
    private readonly IPublicationRepository _repository;
    private readonly ITenantContext _tenantContext;

    public SearchPublicationsQueryHandler(IPublicationRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<IReadOnlyList<PublicationDto>> Handle(SearchPublicationsQuery request, CancellationToken ct)
    {
        var publications = await _repository.SearchAsync(
            _tenantContext.TenantId, request.SearchTerm, request.Type,
            request.Author, request.Year, request.Journal, ct);

        return publications.Select(p => new PublicationDto(
            p.Id, p.Title, p.GetAuthors(), p.Journal, p.Doi, p.PmId,
            p.PublicationDate, p.Type.ToString(), p.Link, p.Abstract,
            p.GetAttachments(), p.IsVerified, p.CreatedAt
        )).ToList();
    }
}
