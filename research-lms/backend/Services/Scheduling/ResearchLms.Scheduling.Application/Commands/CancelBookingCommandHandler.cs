using MediatR;
using ResearchLms.Scheduling.Domain.Exceptions;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Application.Commands;

public class CancelBookingCommandHandler : IRequestHandler<CancelBookingCommand, Unit>
{
    private readonly IBookingRepository _bookingRepo;
    private readonly IAvailabilityService _availabilityService;
    private readonly IWaitlistService _waitlistService;

    public CancelBookingCommandHandler(
        IBookingRepository bookingRepo,
        IAvailabilityService availabilityService,
        IWaitlistService waitlistService)
    {
        _bookingRepo = bookingRepo;
        _availabilityService = availabilityService;
        _waitlistService = waitlistService;
    }

    public async Task<Unit> Handle(CancelBookingCommand request, CancellationToken ct)
    {
        var booking = await _bookingRepo.GetByIdAsync(request.BookingId, ct);
        if (booking is null)
            throw new NotFoundException("Booking not found.");

        booking.Cancel(request.Reason);
        await _bookingRepo.UpdateAsync(booking, ct);

        var bookingDate = DateOnly.FromDateTime(booking.StartTime);
        await _availabilityService.InvalidateCacheAsync(booking.ResourceId, bookingDate);

        await _waitlistService.PromoteNextAsync(
            booking.ResourceId,
            DateOnly.FromDateTime(booking.StartTime),
            TimeOnly.FromDateTime(booking.StartTime),
            TimeOnly.FromDateTime(booking.EndTime),
            ct);

        return Unit.Value;
    }
}
