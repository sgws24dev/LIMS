using MediatR;

namespace ResearchLms.Scheduling.Application.Commands;

public record CheckInBookingCommand(Guid BookingId) : IRequest<Unit>;
