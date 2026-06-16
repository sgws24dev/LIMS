using Microsoft.EntityFrameworkCore;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Infrastructure.Persistence;
using ResearchLms.Shared.Domain.Entities;
using ResearchLms.Shared.Domain.Enums;

namespace ResearchLms.Facilities.Infrastructure.Persistence;

public class AssetRepository : IAssetRepository
{
    private readonly ResearchLmsDbContext _context;
    public AssetRepository(ResearchLmsDbContext context) => _context = context;

    public async Task<Asset?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Assets.Include(a => a.Facility).FirstOrDefaultAsync(a => a.Id == id, ct);

    public async Task<(IReadOnlyList<Asset> Items, int TotalCount)> GetAllAsync(
        string? search = null, string? category = null, string? status = null,
        Guid? facilityId = null, int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var query = _context.Assets.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(a => a.Name.Contains(search) || a.Identifier.Contains(search) || a.Model!.Contains(search));
        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(a => a.Category == category);
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(a => a.Status.ToString() == status);
        if (facilityId.HasValue)
            query = query.Where(a => a.FacilityId == facilityId.Value);
        var totalCount = await query.CountAsync(ct);
        var items = await query.OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize).Include(a => a.Facility).ToListAsync(ct);
        return (items, totalCount);
    }

    public async Task AddAsync(Asset asset, CancellationToken ct = default)
    { await _context.Assets.AddAsync(asset, ct); await _context.SaveChangesAsync(ct); }

    public async Task UpdateAsync(Asset asset, CancellationToken ct = default)
    { _context.Assets.Update(asset); await _context.SaveChangesAsync(ct); }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var asset = await _context.Assets.FindAsync(new object[] { id }, ct);
        if (asset is not null) { _context.Assets.Remove(asset); await _context.SaveChangesAsync(ct); }
    }

    public IQueryable<Asset> Query() => _context.Assets.AsQueryable();

    public async Task<IEnumerable<Asset>> GetHistoryAsync(Guid assetId, CancellationToken ct = default)
        => await _context.Assets.TemporalAll()
            .Where(a => a.Id == assetId)
            .OrderBy(a => EF.Property<DateTime>(a, "ValidFrom"))
            .ToListAsync(ct);

    public async Task<Asset?> GetAsOfAsync(Guid assetId, DateTime pointInTime, CancellationToken ct = default)
        => await _context.Assets.TemporalAsOf(pointInTime)
            .FirstOrDefaultAsync(a => a.Id == assetId, ct);

    public async Task<IEnumerable<Asset>> GetActiveAssetsForDepreciationAsync(CancellationToken ct = default)
        => await _context.Assets
            .Where(a => a.AcquisitionDate != null
                && a.UsefulLifeYears != null
                && a.AcquisitionCost != null
                && a.Status != AssetStatus.Decommissioned
                && a.Status != AssetStatus.Disposed)
            .ToListAsync(ct);
}
