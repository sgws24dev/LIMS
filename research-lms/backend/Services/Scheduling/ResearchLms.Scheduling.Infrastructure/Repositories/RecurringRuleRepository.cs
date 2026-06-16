using Microsoft.EntityFrameworkCore;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Infrastructure.Persistence;

namespace ResearchLms.Scheduling.Infrastructure.Repositories;

public class RecurringRuleRepository : IRecurringRuleRepository
{
    private readonly SchedulingDbContext _db;

    public RecurringRuleRepository(SchedulingDbContext db) => _db = db;

    public async Task<RecurringRule?> GetByIdAsync(Guid id, CancellationToken ct) =>
        await _db.RecurringRules
            .Include(r => r.Bookings.Where(b => b.Status == BookingStatus.Pending || b.Status == BookingStatus.Confirmed))
            .FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<(IEnumerable<RecurringRule> Items, int TotalCount)> GetPagedAsync(
        Guid? userId, Guid? resourceId, RecurringRuleStatus? status,
        int page, int pageSize, CancellationToken ct)
    {
        var query = _db.RecurringRules.AsQueryable();

        if (userId.HasValue) query = query.Where(r => r.UserId == userId.Value);
        if (resourceId.HasValue) query = query.Where(r => r.ResourceId == resourceId.Value);
        if (status.HasValue) query = query.Where(r => r.Status == status.Value);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<RecurringRule> AddAsync(RecurringRule rule, CancellationToken ct)
    {
        await _db.RecurringRules.AddAsync(rule, ct);
        await _db.SaveChangesAsync(ct);
        return rule;
    }

    public async Task UpdateAsync(RecurringRule rule, CancellationToken ct)
    {
        _db.RecurringRules.Update(rule);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IEnumerable<Booking>> GetFutureInstancesAsync(Guid ruleId, CancellationToken ct) =>
        await _db.Bookings
            .Where(b => b.RecurringRuleId == ruleId
                     && b.StartTime > DateTime.UtcNow
                     && (b.Status == BookingStatus.Pending || b.Status == BookingStatus.Confirmed))
            .OrderBy(b => b.StartTime)
            .ToListAsync(ct);
}
