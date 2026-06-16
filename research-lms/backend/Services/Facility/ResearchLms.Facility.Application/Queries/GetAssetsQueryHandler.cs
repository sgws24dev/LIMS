using MediatR;
using ResearchLms.Facilities.Application.Mappings;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public class GetAssetsQueryHandler : IRequestHandler<GetAssetsQuery, Result<(IReadOnlyList<Application.DTOs.AssetDto> Items, int TotalCount)>>
{
    private readonly IAssetRepository _repository;

    public GetAssetsQueryHandler(IAssetRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<(IReadOnlyList<Application.DTOs.AssetDto> Items, int TotalCount)>> Handle(
        GetAssetsQuery request, CancellationToken ct)
    {
        var result = await _repository.GetAllAsync(
            request.Search, request.Category, request.Status,
            request.FacilityId, request.Page, request.PageSize, ct);

        return Result.Success((
            result.Items.Select(AssetMapping.ToDto).ToList() as IReadOnlyList<Application.DTOs.AssetDto>,
            result.TotalCount));
    }
}
