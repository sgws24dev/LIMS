using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Domain.Interfaces;

public record BookingFilter(
    Guid? UserId,
    Guid? ResourceId,
    ResourceType? ResourceType,
    BookingStatus? Status,
    DateTime? From,
    DateTime? To,
    string? Search
);

public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<(IEnumerable<Booking> Items, int TotalCount)> GetPagedAsync(
        BookingFilter filter, int page, int pageSize, CancellationToken ct);
    Task<IEnumerable<Booking>> GetByResourceAndRangeAsync(
        Guid resourceId, DateTime from, DateTime to, CancellationToken ct);
    Task<IEnumerable<Booking>> GetByUserAndRangeAsync(
        Guid userId, DateTime from, DateTime to, CancellationToken ct);
    Task<bool> HasOverlapAsync(
        Guid resourceId, DateTime start, DateTime end,
        Guid? excludeBookingId, CancellationToken ct);
    Task<Booking> AddAsync(Booking booking, CancellationToken ct);
    Task UpdateAsync(Booking booking, CancellationToken ct);
}
