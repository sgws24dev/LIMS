using MediatR;
using ResearchLms.Content.Application.DTOs;
using ResearchLms.Content.Application.Services;

namespace ResearchLms.Content.Application.Queries;

public record SearchByDoiQuery(string Doi) : IRequest<CreatePublicationRequest?>;

public class SearchByDoiQueryHandler : IRequestHandler<SearchByDoiQuery, CreatePublicationRequest?>
{
    private readonly IDoiService _doiService;

    public SearchByDoiQueryHandler(IDoiService doiService)
    {
        _doiService = doiService;
    }

    public async Task<CreatePublicationRequest?> Handle(SearchByDoiQuery request, CancellationToken ct)
    {
        return await _doiService.LookupDoiAsync(request.Doi, ct);
    }
}