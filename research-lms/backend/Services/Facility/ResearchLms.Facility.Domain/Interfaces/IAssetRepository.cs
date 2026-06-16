using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Domain.Interfaces;

public interface IAssetRepository
{
    Task<Asset?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IReadOnlyList<Asset> Items, int TotalCount)> GetAllAsync(
        string? search = null, string? category = null, string? status = null,
        Guid? facilityId = null, int page = 1, int pageSize = 20, CancellationToken ct = default);
    Task AddAsync(Asset asset, CancellationToken ct = default);
    Task UpdateAsync(Asset asset, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    IQueryable<Asset> Query();
    Task<IEnumerable<Asset>> GetHistoryAsync(Guid assetId, CancellationToken ct = default);
    Task<Asset?> GetAsOfAsync(Guid assetId, DateTime pointInTime, CancellationToken ct = default);
    Task<IEnumerable<Asset>> GetActiveAssetsForDepreciationAsync(CancellationToken ct = default);
}
