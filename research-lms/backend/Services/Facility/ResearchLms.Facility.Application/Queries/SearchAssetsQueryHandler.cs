using MediatR;
using ResearchLms.Facilities.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public class SearchAssetsQueryHandler : IRequestHandler<SearchAssetsQuery, Result<AssetPagedResult>>
{
    private readonly IAssetSearchService _searchService;

    public SearchAssetsQueryHandler(IAssetSearchService searchService)
    {
        _searchService = searchService;
    }

    public async Task<Result<AssetPagedResult>> Handle(SearchAssetsQuery request, CancellationToken ct)
    {
        var result = await _searchService.SearchAsync(request.Params, ct);
        return Result.Success(result);
    }
}
