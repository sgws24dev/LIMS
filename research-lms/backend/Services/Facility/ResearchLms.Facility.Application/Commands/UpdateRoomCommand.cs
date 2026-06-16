using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public record UpdateRoomCommand(Guid Id, UpdateRoomDto Dto) : IRequest<Result<RoomDto>>;

public class UpdateRoomHandler : IRequestHandler<UpdateRoomCommand, Result<RoomDto>>
{
    private readonly IFacilityService _service;
    public UpdateRoomHandler(IFacilityService service) => _service = service;
    public async Task<Result<RoomDto>> Handle(UpdateRoomCommand request, CancellationToken ct)
        => await _service.UpdateRoomAsync(request.Id, request.Dto, ct);
}
