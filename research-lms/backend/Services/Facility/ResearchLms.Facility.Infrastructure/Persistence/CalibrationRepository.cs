using Microsoft.EntityFrameworkCore;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Infrastructure.Persistence;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Infrastructure.Persistence;

public class CalibrationRepository : ICalibrationRepository
{
    private readonly ResearchLmsDbContext _context;
    private readonly ITenantContext _tenantContext;

    public CalibrationRepository(ResearchLmsDbContext context, ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public async Task<CalibrationRecord?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.CalibrationRecords
            .Include(c => c.Instrument)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<(IReadOnlyList<CalibrationRecord> Items, int TotalCount)> GetAllAsync(
        Guid? instrumentId = null, string? status = null,
        int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var query = _context.CalibrationRecords.AsQueryable();

        if (instrumentId.HasValue)
            query = query.Where(c => c.InstrumentId == instrumentId.Value);
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(c => c.Status.ToString() == status);

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(c => c.CalibrationDate)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Include(c => c.Instrument)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task AddAsync(CalibrationRecord record, CancellationToken ct = default)
    {
        await _context.CalibrationRecords.AddAsync(record, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(CalibrationRecord record, CancellationToken ct = default)
    {
        _context.CalibrationRecords.Update(record);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<IEnumerable<CalibrationRecord>> GetDueSoonAsync(int withinDays, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var cutoff = today.AddDays(withinDays);
        return await _context.CalibrationRecords
            .Where(c => c.NextDueDate >= today && c.NextDueDate <= cutoff)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<CalibrationRecord>> GetExpiredAsync(CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return await _context.CalibrationRecords
            .Where(c => c.NextDueDate < today)
            .ToListAsync(ct);
    }

    public async Task<(int DueSoonCount, int ExpiredCount, int ValidCount)> GetSummaryAsync(CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dueSoonCutoff = today.AddDays(30);

        var all = await _context.CalibrationRecords.ToListAsync(ct);

        var dueSoon = all.Count(c => c.NextDueDate >= today && c.NextDueDate <= dueSoonCutoff);
        var expired = all.Count(c => c.NextDueDate < today);
        var valid = all.Count(c => c.NextDueDate > dueSoonCutoff);

        return (dueSoon, expired, valid);
    }
}
