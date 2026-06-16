using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public record GetRoomsByFacilityQuery(Guid FacilityId) : IRequest<Result<IReadOnlyList<RoomDto>>>;

public class GetRoomsByFacilityHandler : IRequestHandler<GetRoomsByFacilityQuery, Result<IReadOnlyList<RoomDto>>>
{
    private readonly IFacilityService _service;
    public GetRoomsByFacilityHandler(IFacilityService service) => _service = service;
    public async Task<Result<IReadOnlyList<RoomDto>>> Handle(GetRoomsByFacilityQuery request, CancellationToken ct)
        => await _service.GetRoomsAsync(request.FacilityId, ct);
}
