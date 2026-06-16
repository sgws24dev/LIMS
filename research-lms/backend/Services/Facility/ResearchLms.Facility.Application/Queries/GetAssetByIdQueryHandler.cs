using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Application.Mappings;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public class GetAssetByIdQueryHandler : IRequestHandler<GetAssetByIdQuery, Result<AssetDetailDto>>
{
    private readonly IAssetRepository _repository;

    public GetAssetByIdQueryHandler(IAssetRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AssetDetailDto>> Handle(GetAssetByIdQuery request, CancellationToken ct)
    {
        var asset = await _repository.GetByIdAsync(request.Id, ct);
        if (asset is null)
            return Result.Failure<AssetDetailDto>("NOT_FOUND", "Asset not found.");

        return Result.Success(AssetMapping.ToDetailDto(asset));
    }
}
