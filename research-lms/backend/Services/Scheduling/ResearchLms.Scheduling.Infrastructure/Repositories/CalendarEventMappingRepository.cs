using Microsoft.EntityFrameworkCore;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Infrastructure.Persistence;

namespace ResearchLms.Scheduling.Infrastructure.Repositories;

public class CalendarEventMappingRepository : ICalendarEventMappingRepository
{
    private readonly SchedulingDbContext _context;
    public CalendarEventMappingRepository(SchedulingDbContext context) => _context = context;

    public async Task<CalendarEventMapping?> GetByBookingIdAsync(Guid bookingId, SyncProvider provider, CancellationToken ct) =>
        await _context.CalendarEventMappings.FirstOrDefaultAsync(
            m => m.BookingId == bookingId && m.Provider == provider, ct);

    public async Task<CalendarEventMapping> AddAsync(CalendarEventMapping mapping, CancellationToken ct)
    {
        _context.CalendarEventMappings.Add(mapping);
        await _context.SaveChangesAsync(ct);
        return mapping;
    }

    public async Task DeleteAsync(Guid bookingId, SyncProvider provider, CancellationToken ct)
    {
        var mapping = await _context.CalendarEventMappings
            .FirstOrDefaultAsync(m => m.BookingId == bookingId && m.Provider == provider, ct);
        if (mapping is not null)
        {
            _context.CalendarEventMappings.Remove(mapping);
            await _context.SaveChangesAsync(ct);
        }
    }
}
