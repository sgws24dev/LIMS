using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public record UpdateFacilityCommand(Guid Id, UpdateFacilityDto Dto) : IRequest<Result<FacilityDto>>;

public class UpdateFacilityHandler : IRequestHandler<UpdateFacilityCommand, Result<FacilityDto>>
{
    private readonly IFacilityService _service;
    public UpdateFacilityHandler(IFacilityService service) => _service = service;
    public async Task<Result<FacilityDto>> Handle(UpdateFacilityCommand request, CancellationToken ct)
        => await _service.UpdateAsync(request.Id, request.Dto, ct);
}
