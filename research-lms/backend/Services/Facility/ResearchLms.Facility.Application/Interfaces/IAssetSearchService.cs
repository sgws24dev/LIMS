using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Application.Interfaces;

public interface IAssetSearchService
{
    Task<AssetPagedResult> SearchAsync(AssetSearchParams @params, CancellationToken ct);
    Task IndexAsync(Asset asset, CancellationToken ct);
    Task DeleteIndexAsync(Guid assetId, CancellationToken ct);
}

public record AssetPagedResult(IReadOnlyList<AssetDto> Items, int TotalCount);
