using MediatR;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Application.Queries;

public class GetBookingsQueryHandler : IRequestHandler<GetBookingsQuery, (IEnumerable<BookingDto> Items, int TotalCount)>
{
    private readonly IBookingRepository _bookingRepo;

    public GetBookingsQueryHandler(IBookingRepository bookingRepo)
    {
        _bookingRepo = bookingRepo;
    }

    public async Task<(IEnumerable<BookingDto> Items, int TotalCount)> Handle(
        GetBookingsQuery request, CancellationToken ct)
    {
        var filter = new BookingFilter(
            request.UserId,
            request.ResourceId,
            request.ResourceType,
            request.Status,
            request.From,
            request.To,
            request.Search);

        var (items, total) = await _bookingRepo.GetPagedAsync(
            filter, request.Page, request.PageSize, ct);

        var dtos = items.Select(b => new BookingDto(
            b.Id, b.ResourceId,
            b.BookingResource?.Name ?? string.Empty,
            b.BookingResource?.Identifier ?? string.Empty,
            b.ResourceType, b.UserId, b.UserName, b.Title,
            b.StartTime, b.EndTime, b.Status, b.Purpose, b.Notes, b.Cost, b.CreatedAt));

        return (dtos, total);
    }
}
