using MediatR;
using ResearchLms.Scheduling.Application.DTOs;

namespace ResearchLms.Scheduling.Application.Queries;

public record GetBookingByIdQuery(Guid BookingId) : IRequest<BookingDetailDto?>;
