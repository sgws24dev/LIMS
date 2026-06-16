using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public record GetAssetsQuery(
    string? Search, string? Category, string? Status,
    Guid? FacilityId, int Page = 1, int PageSize = 20)
    : IRequest<Result<(IReadOnlyList<AssetDto> Items, int TotalCount)>>;

public record GetAssetByIdQuery(Guid Id) : IRequest<Result<AssetDetailDto>>;

public record SearchAssetsQuery(AssetSearchParams Params) : IRequest<Result<AssetPagedResult>>;
