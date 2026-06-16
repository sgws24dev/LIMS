using Microsoft.EntityFrameworkCore;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Infrastructure.Persistence;

namespace ResearchLms.Scheduling.Infrastructure.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly SchedulingDbContext _db;

    public BookingRepository(SchedulingDbContext db)
    {
        _db = db;
    }

    public async Task<Booking?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.Bookings
            .Include(b => b.BookingResource)
            .FirstOrDefaultAsync(b => b.Id == id, ct);
    }

    public async Task<(IEnumerable<Booking> Items, int TotalCount)> GetPagedAsync(
        BookingFilter filter, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.Bookings
            .Include(b => b.BookingResource)
            .AsQueryable();

        if (filter.UserId.HasValue)
            query = query.Where(b => b.UserId == filter.UserId.Value);
        if (filter.ResourceId.HasValue)
            query = query.Where(b => b.ResourceId == filter.ResourceId.Value);
        if (filter.ResourceType.HasValue)
            query = query.Where(b => b.ResourceType == filter.ResourceType.Value);
        if (filter.Status.HasValue)
            query = query.Where(b => b.Status == filter.Status.Value);
        if (filter.From.HasValue)
            query = query.Where(b => b.StartTime >= filter.From.Value);
        if (filter.To.HasValue)
            query = query.Where(b => b.EndTime <= filter.To.Value);
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.ToLower();
            query = query.Where(b =>
                b.Title.ToLower().Contains(search) ||
                b.UserName.ToLower().Contains(search) ||
                (b.Purpose != null && b.Purpose.ToLower().Contains(search)));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(b => b.StartTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<IEnumerable<Booking>> GetByResourceAndRangeAsync(
        Guid resourceId, DateTime from, DateTime to, CancellationToken ct)
    {
        return await _db.Bookings
            .Where(b => b.ResourceId == resourceId &&
                        b.StartTime < to &&
                        b.EndTime > from &&
                        b.Status != Domain.Enums.BookingStatus.Cancelled &&
                        b.Status != Domain.Enums.BookingStatus.NoShow)
            .OrderBy(b => b.StartTime)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Booking>> GetByUserAndRangeAsync(
        Guid userId, DateTime from, DateTime to, CancellationToken ct)
    {
        return await _db.Bookings
            .Include(b => b.BookingResource)
            .Where(b => b.UserId == userId &&
                        b.StartTime < to &&
                        b.EndTime > from &&
                        b.Status != Domain.Enums.BookingStatus.Cancelled &&
                        b.Status != Domain.Enums.BookingStatus.NoShow)
            .OrderBy(b => b.StartTime)
            .ToListAsync(ct);
    }

    public async Task<bool> HasOverlapAsync(
        Guid resourceId, DateTime start, DateTime end,
        Guid? excludeBookingId, CancellationToken ct)
    {
        var query = _db.Bookings
            .Where(b => b.ResourceId == resourceId &&
                        b.StartTime < end &&
                        b.EndTime > start &&
                        b.Status != Domain.Enums.BookingStatus.Cancelled &&
                        b.Status != Domain.Enums.BookingStatus.NoShow);

        if (excludeBookingId.HasValue)
            query = query.Where(b => b.Id != excludeBookingId.Value);

        return await query.AnyAsync(ct);
    }

    public async Task<Booking> AddAsync(Booking booking, CancellationToken ct)
    {
        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync(ct);
        return booking;
    }

    public async Task UpdateAsync(Booking booking, CancellationToken ct)
    {
        _db.Bookings.Update(booking);
        await _db.SaveChangesAsync(ct);
    }
}
