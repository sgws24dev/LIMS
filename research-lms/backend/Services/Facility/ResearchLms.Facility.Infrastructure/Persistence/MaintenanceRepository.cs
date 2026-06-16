using Microsoft.EntityFrameworkCore;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Infrastructure.Persistence;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Infrastructure.Persistence;

public class MaintenanceRepository : IMaintenanceRepository
{
    private readonly ResearchLmsDbContext _context;
    private readonly ITenantContext _tenantContext;

    public MaintenanceRepository(ResearchLmsDbContext context, ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public async Task<MaintenanceRecord?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.MaintenanceRecords
            .Include(m => m.Asset)
            .Include(m => m.WorkOrders)
            .FirstOrDefaultAsync(m => m.Id == id, ct);

    public async Task<(IReadOnlyList<MaintenanceRecord> Items, int TotalCount)> GetAllAsync(
        Guid? assetId = null, string? status = null,
        DateOnly? dateFrom = null, DateOnly? dateTo = null,
        int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var query = _context.MaintenanceRecords.AsQueryable();

        if (assetId.HasValue)
            query = query.Where(m => m.AssetId == assetId.Value);
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(m => m.Status.ToString() == status);
        if (dateFrom.HasValue)
            query = query.Where(m => m.ScheduledDate >= dateFrom.Value);
        if (dateTo.HasValue)
            query = query.Where(m => m.ScheduledDate <= dateTo.Value);

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(m => m.ScheduledDate)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Include(m => m.Asset)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task<IEnumerable<MaintenanceRecord>> GetCalendarAsync(int month, int year, Guid? facilityId, CancellationToken ct = default)
    {
        var query = _context.MaintenanceRecords
            .Include(m => m.Asset)
            .Where(m => m.ScheduledDate.Year == year && m.ScheduledDate.Month == month);

        if (facilityId.HasValue)
            query = query.Where(m => m.Asset!.FacilityId == facilityId.Value);

        return await query.OrderBy(m => m.ScheduledDate).ToListAsync(ct);
    }

    public async Task AddAsync(MaintenanceRecord record, CancellationToken ct = default)
    {
        await _context.MaintenanceRecords.AddAsync(record, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(MaintenanceRecord record, CancellationToken ct = default)
    {
        _context.MaintenanceRecords.Update(record);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<IEnumerable<MaintenanceRecord>> GetOverdueRecordsAsync(CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return await _context.MaintenanceRecords
            .Where(m => m.Status == MaintenanceStatus.Scheduled || m.Status == MaintenanceStatus.InProgress)
            .Where(m => m.ScheduledDate < today)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<MaintenanceRecord>> GetScheduledRecordsForDateAsync(DateOnly date, CancellationToken ct = default)
    {
        return await _context.MaintenanceRecords
            .Where(m => m.ScheduledDate == date)
            .ToListAsync(ct);
    }
}
