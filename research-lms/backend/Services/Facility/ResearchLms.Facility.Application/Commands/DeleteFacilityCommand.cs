using MediatR;
using ResearchLms.Facilities.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public record DeleteFacilityCommand(Guid Id) : IRequest<Result>;

public class DeleteFacilityHandler : IRequestHandler<DeleteFacilityCommand, Result>
{
    private readonly IFacilityService _service;
    public DeleteFacilityHandler(IFacilityService service) => _service = service;
    public async Task<Result> Handle(DeleteFacilityCommand request, CancellationToken ct)
        => await _service.DeleteAsync(request.Id, ct);
}
