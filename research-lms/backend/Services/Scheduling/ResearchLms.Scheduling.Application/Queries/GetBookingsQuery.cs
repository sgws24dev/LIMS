using MediatR;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.Queries;

public record GetBookingsQuery(
    Guid? UserId,
    Guid? ResourceId,
    ResourceType? ResourceType,
    BookingStatus? Status,
    DateTime? From,
    DateTime? To,
    string? Search,
    int Page,
    int PageSize
) : IRequest<(IEnumerable<BookingDto> Items, int TotalCount)>;
