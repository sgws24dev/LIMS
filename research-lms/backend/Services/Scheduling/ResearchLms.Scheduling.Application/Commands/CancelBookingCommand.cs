using MediatR;

namespace ResearchLms.Scheduling.Application.Commands;

public record CancelBookingCommand(
    Guid BookingId,
    string? Reason
) : IRequest<Unit>;
