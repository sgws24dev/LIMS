using MediatR;
using ResearchLms.Scheduling.Domain.Exceptions;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Application.Commands;

public class CheckInBookingCommandHandler : IRequestHandler<CheckInBookingCommand, Unit>
{
    private readonly IBookingRepository _bookingRepo;

    public CheckInBookingCommandHandler(IBookingRepository bookingRepo) => _bookingRepo = bookingRepo;

    public async Task<Unit> Handle(CheckInBookingCommand cmd, CancellationToken ct)
    {
        var booking = await _bookingRepo.GetByIdAsync(cmd.BookingId, ct);
        if (booking is null)
            throw new NotFoundException("Booking not found.");

        booking.CheckIn();
        await _bookingRepo.UpdateAsync(booking, ct);
        return Unit.Value;
    }
}
