using MediatR;
using ResearchLms.Facilities.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public record DeleteRoomCommand(Guid Id) : IRequest<Result>;

public class DeleteRoomHandler : IRequestHandler<DeleteRoomCommand, Result>
{
    private readonly IFacilityService _service;
    public DeleteRoomHandler(IFacilityService service) => _service = service;
    public async Task<Result> Handle(DeleteRoomCommand request, CancellationToken ct)
        => await _service.DeleteRoomAsync(request.Id, ct);
}
