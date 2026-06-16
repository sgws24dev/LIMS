using MediatR;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Application.Queries;

public class GetConflictsQueryHandler : IRequestHandler<GetConflictsQuery, IEnumerable<ConflictDto>>
{
    private readonly IBookingRepository _bookingRepo;

    public GetConflictsQueryHandler(IBookingRepository bookingRepo) => _bookingRepo = bookingRepo;

    public async Task<IEnumerable<ConflictDto>> Handle(GetConflictsQuery request, CancellationToken ct)
    {
        var conflicts = new List<ConflictDto>();
        var processed = new HashSet<Guid>();

        if (request.ResourceId.HasValue)
        {
            var resourceBookings = await _bookingRepo.GetByResourceAndRangeAsync(
                request.ResourceId.Value, request.From, request.To, ct);
            foreach (var b in resourceBookings)
            {
                if (processed.Add(b.Id) && b.Status != BookingStatus.Cancelled && b.Status != BookingStatus.NoShow)
                {
                    conflicts.Add(new ConflictDto(b.Id, b.Title, b.ResourceId,
                        b.BookingResource?.Name ?? "", b.UserId, b.UserName,
                        b.StartTime, b.EndTime, b.Status));
                }
            }
        }

        if (request.UserId.HasValue)
        {
            var userBookings = await _bookingRepo.GetByUserAndRangeAsync(
                request.UserId.Value, request.From, request.To, ct);
            foreach (var b in userBookings)
            {
                if (processed.Add(b.Id) && b.Status != BookingStatus.Cancelled && b.Status != BookingStatus.NoShow)
                {
                    conflicts.Add(new ConflictDto(b.Id, b.Title, b.ResourceId,
                        b.BookingResource?.Name ?? "", b.UserId, b.UserName,
                        b.StartTime, b.EndTime, b.Status));
                }
            }
        }

        return conflicts;
    }
}
