using MediatR;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Application.Queries;

public class GetResourcesQueryHandler : IRequestHandler<GetResourcesQuery, IEnumerable<BookingResourceDto>>
{
    private readonly IBookingResourceRepository _resourceRepo;

    public GetResourcesQueryHandler(IBookingResourceRepository resourceRepo)
    {
        _resourceRepo = resourceRepo;
    }

    public async Task<IEnumerable<BookingResourceDto>> Handle(
        GetResourcesQuery request, CancellationToken ct)
    {
        var resources = await _resourceRepo.SearchAsync(
            request.Query, request.Type, request.TenantId, ct);

        return resources.Select(r => new BookingResourceDto(
            r.ResourceId, r.Name, r.Identifier, r.ResourceType,
            r.Location, r.FacilityName, r.HourlyRate, r.IsActive));
    }
}
