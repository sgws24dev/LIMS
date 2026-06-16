using MediatR;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Application.Queries;

public class GetOperatingHoursQueryHandler : IRequestHandler<GetOperatingHoursQuery, ResourceOperatingHoursDto?>
{
    private readonly IOperatingHoursRepository _repo;

    public GetOperatingHoursQueryHandler(IOperatingHoursRepository repo) => _repo = repo;

    public async Task<ResourceOperatingHoursDto?> Handle(GetOperatingHoursQuery request, CancellationToken ct)
    {
        var hours = await _repo.GetByResourceIdAsync(request.ResourceId, ct);
        if (hours is null) return null;

        return new ResourceOperatingHoursDto(
            hours.ResourceId,
            hours.MondayStart, hours.MondayEnd,
            hours.TuesdayStart, hours.TuesdayEnd,
            hours.WednesdayStart, hours.WednesdayEnd,
            hours.ThursdayStart, hours.ThursdayEnd,
            hours.FridayStart, hours.FridayEnd,
            hours.SaturdayStart, hours.SaturdayEnd,
            hours.SundayStart, hours.SundayEnd,
            hours.Timezone);
    }
}
