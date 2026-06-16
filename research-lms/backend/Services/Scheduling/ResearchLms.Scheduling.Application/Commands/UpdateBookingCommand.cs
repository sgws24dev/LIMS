using MediatR;

namespace ResearchLms.Scheduling.Application.Commands;

public record UpdateBookingCommand(
    Guid BookingId,
    string Title,
    DateTime StartTime,
    DateTime EndTime,
    string? Purpose,
    string? Notes
) : IRequest<Unit>;
