using Microsoft.EntityFrameworkCore;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Infrastructure.Repositories;

public class WaitlistRepository : IWaitlistRepository
{
    private readonly Persistence.SchedulingDbContext _db;

    public WaitlistRepository(Persistence.SchedulingDbContext db) => _db = db;

    public async Task<WaitlistEntry?> GetByIdAsync(Guid id, CancellationToken ct) =>
        await _db.WaitlistEntries.FindAsync([id], ct);

    public async Task<bool> HasExistingWaitingAsync(Guid userId, Guid resourceId, DateOnly date,
        TimeOnly start, TimeOnly end, CancellationToken ct) =>
        await _db.WaitlistEntries.AnyAsync(w =>
            w.UserId == userId &&
            w.ResourceId == resourceId &&
            w.RequestedDate == date &&
            w.RequestedStartTime == start &&
            w.RequestedEndTime == end &&
            w.Status == WaitlistStatus.Waiting, ct);

    public async Task<(IEnumerable<WaitlistEntry> Items, int TotalCount)> GetPagedAsync(
        Guid? userId, Guid? resourceId, WaitlistStatus? status, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.WaitlistEntries.AsQueryable();
        if (userId.HasValue) q = q.Where(w => w.UserId == userId.Value);
        if (resourceId.HasValue) q = q.Where(w => w.ResourceId == resourceId.Value);
        if (status.HasValue) q = q.Where(w => w.Status == status.Value);

        var total = await q.CountAsync(ct);
        var items = await q.OrderByDescending(w => w.Priority).ThenBy(w => w.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public async Task<WaitlistEntry?> GetNextForPromotionAsync(Guid resourceId, DateOnly date,
        TimeOnly start, TimeOnly end, CancellationToken ct) =>
        await _db.WaitlistEntries
            .Where(w => w.ResourceId == resourceId &&
                        w.RequestedDate == date &&
                        w.RequestedStartTime == start &&
                        w.RequestedEndTime == end &&
                        w.Status == WaitlistStatus.Waiting)
            .OrderByDescending(w => w.Priority)
            .ThenBy(w => w.CreatedAt)
            .FirstOrDefaultAsync(ct);

    public async Task<IEnumerable<WaitlistEntry>> GetStalePromotionsAsync(CancellationToken ct) =>
        await _db.WaitlistEntries
            .Where(w => w.Status == WaitlistStatus.Promoted &&
                        w.ExpiresAt != null &&
                        w.ExpiresAt < DateTime.UtcNow)
            .ToListAsync(ct);

    public async Task<WaitlistEntry> AddAsync(WaitlistEntry entry, CancellationToken ct)
    {
        _db.WaitlistEntries.Add(entry);
        await _db.SaveChangesAsync(ct);
        return entry;
    }

    public async Task UpdateAsync(WaitlistEntry entry, CancellationToken ct)
    {
        _db.WaitlistEntries.Update(entry);
        await _db.SaveChangesAsync(ct);
    }
}
