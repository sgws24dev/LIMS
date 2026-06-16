using MediatR;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Application.Queries;

public class GetAvailabilityQueryHandler : IRequestHandler<GetAvailabilityQuery, IEnumerable<TimeSlotDto>>
{
    private readonly IAvailabilityService _service;

    public GetAvailabilityQueryHandler(IAvailabilityService service) => _service = service;

    public async Task<IEnumerable<TimeSlotDto>> Handle(GetAvailabilityQuery request, CancellationToken ct)
    {
        var slots = await _service.GetAvailableSlotsAsync(request.ResourceId, request.Date, ct);
        return slots.Select(s => new TimeSlotDto(s.Start, s.End, s.DurationHours));
    }
}

public class GetSlotGridQueryHandler : IRequestHandler<GetSlotGridQuery, IEnumerable<SlotAvailabilityDto>>
{
    private readonly IAvailabilityService _service;

    public GetSlotGridQueryHandler(IAvailabilityService service) => _service = service;

    public async Task<IEnumerable<SlotAvailabilityDto>> Handle(GetSlotGridQuery request, CancellationToken ct)
    {
        var slots = await _service.GetSlotGridAsync(request.ResourceId, request.From, request.To, ct);
        return slots.Select(s => new SlotAvailabilityDto(
            s.SlotStart, s.SlotEnd, s.Status.ToString(), s.UnavailableReason));
    }
}
