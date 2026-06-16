using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public record CreateRoomCommand(Guid FacilityId, CreateRoomDto Dto) : IRequest<Result<RoomDto>>;

public class CreateRoomHandler : IRequestHandler<CreateRoomCommand, Result<RoomDto>>
{
    private readonly IFacilityService _service;
    public CreateRoomHandler(IFacilityService service) => _service = service;
    public async Task<Result<RoomDto>> Handle(CreateRoomCommand request, CancellationToken ct)
        => await _service.CreateRoomAsync(request.FacilityId, request.Dto, ct);
}
