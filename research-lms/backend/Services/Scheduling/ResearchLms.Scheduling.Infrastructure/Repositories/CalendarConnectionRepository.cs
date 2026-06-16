using Microsoft.EntityFrameworkCore;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Infrastructure.Persistence;

namespace ResearchLms.Scheduling.Infrastructure.Repositories;

public class CalendarConnectionRepository : ICalendarConnectionRepository
{
    private readonly SchedulingDbContext _context;
    public CalendarConnectionRepository(SchedulingDbContext context) => _context = context;

    public async Task<CalendarConnection?> GetAsync(Guid userId, SyncProvider provider, CancellationToken ct) =>
        await _context.CalendarConnections.FirstOrDefaultAsync(
            c => c.UserId == userId && c.Provider == provider && c.IsActive, ct);

    public async Task<IEnumerable<CalendarConnection>> GetActiveAsync(Guid userId, CancellationToken ct) =>
        await _context.CalendarConnections
            .Where(c => c.UserId == userId && c.IsActive).ToListAsync(ct);

    public async Task<IEnumerable<CalendarConnection>> GetAllActiveAsync(CancellationToken ct) =>
        await _context.CalendarConnections.Where(c => c.IsActive).ToListAsync(ct);

    public async Task<CalendarConnection> AddAsync(CalendarConnection connection, CancellationToken ct)
    {
        _context.CalendarConnections.Add(connection);
        await _context.SaveChangesAsync(ct);
        return connection;
    }

    public async Task UpdateAsync(CalendarConnection connection, CancellationToken ct)
    {
        _context.CalendarConnections.Update(connection);
        await _context.SaveChangesAsync(ct);
    }
}
