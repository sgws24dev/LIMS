using Microsoft.EntityFrameworkCore;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Infrastructure.Persistence;

namespace ResearchLms.Scheduling.Infrastructure.Repositories;

public class CalendarSyncLogRepository : ICalendarSyncLogRepository
{
    private readonly SchedulingDbContext _context;
    public CalendarSyncLogRepository(SchedulingDbContext context) => _context = context;

    public async Task<CalendarSyncLog> AddAsync(CalendarSyncLog log, CancellationToken ct)
    {
        _context.CalendarSyncLogs.Add(log);
        await _context.SaveChangesAsync(ct);
        return log;
    }

    public async Task<(IEnumerable<CalendarSyncLog> Items, int TotalCount)> GetPagedAsync(
        Guid userId, int page, int pageSize, CancellationToken ct)
    {
        var query = _context.CalendarSyncLogs
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.SyncedAt);

        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return (items, total);
    }
}
