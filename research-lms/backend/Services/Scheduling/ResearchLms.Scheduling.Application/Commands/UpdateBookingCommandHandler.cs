using MediatR;
using ResearchLms.Scheduling.Domain.Exceptions;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Application.Commands;

public class UpdateBookingCommandHandler : IRequestHandler<UpdateBookingCommand, Unit>
{
    private readonly IBookingRepository _bookingRepo;

    public UpdateBookingCommandHandler(IBookingRepository bookingRepo)
    {
        _bookingRepo = bookingRepo;
    }

    public async Task<Unit> Handle(UpdateBookingCommand request, CancellationToken ct)
    {
        var booking = await _bookingRepo.GetByIdAsync(request.BookingId, ct);
        if (booking is null)
            throw new NotFoundException("Booking not found.");

        if (booking.Status is Domain.Enums.BookingStatus.Cancelled
            or Domain.Enums.BookingStatus.Completed
            or Domain.Enums.BookingStatus.NoShow)
            throw new InvalidOperationException(
                "Cannot update a cancelled, completed, or no-show booking.");

        var overlap = await _bookingRepo.HasOverlapAsync(
            booking.ResourceId,
            request.StartTime.ToUniversalTime(),
            request.EndTime.ToUniversalTime(),
            request.BookingId,
            ct);
        if (overlap)
            throw new BookingConflictException(
                "Resource is already booked for this time slot.");

        booking.Update(
            request.Title,
            request.StartTime.ToUniversalTime(),
            request.EndTime.ToUniversalTime(),
            request.Purpose,
            request.Notes);

        await _bookingRepo.UpdateAsync(booking, ct);
        return Unit.Value;
    }
}
