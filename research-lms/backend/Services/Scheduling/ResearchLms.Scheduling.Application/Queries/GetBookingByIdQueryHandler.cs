using MediatR;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Application.Queries;

public class GetBookingByIdQueryHandler : IRequestHandler<GetBookingByIdQuery, BookingDetailDto?>
{
    private readonly IBookingRepository _bookingRepo;

    public GetBookingByIdQueryHandler(IBookingRepository bookingRepo)
    {
        _bookingRepo = bookingRepo;
    }

    public async Task<BookingDetailDto?> Handle(GetBookingByIdQuery request, CancellationToken ct)
    {
        var booking = await _bookingRepo.GetByIdAsync(request.BookingId, ct);
        if (booking is null) return null;

        return new BookingDetailDto(
            booking.Id, booking.ResourceId,
            booking.BookingResource?.Name ?? string.Empty,
            booking.BookingResource?.Identifier ?? string.Empty,
            booking.ResourceType, booking.UserId, booking.UserName, booking.Title,
            booking.StartTime, booking.EndTime, booking.Status, booking.Purpose,
            booking.Notes, booking.Cost, booking.CreatedAt,
            booking.CancelledAt, booking.CancellationReason,
            booking.CheckedInAt, booking.RecurringRuleId,
            booking.BookingResource?.Location,
            booking.BookingResource?.FacilityName,
            Enumerable.Empty<BookingStatusChangeDto>());
    }
}
