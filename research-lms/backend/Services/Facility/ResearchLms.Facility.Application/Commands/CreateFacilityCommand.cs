using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public record CreateFacilityCommand(CreateFacilityDto Dto) : IRequest<Result<FacilityDto>>;

public class CreateFacilityHandler : IRequestHandler<CreateFacilityCommand, Result<FacilityDto>>
{
    private readonly IFacilityService _service;
    public CreateFacilityHandler(IFacilityService service) => _service = service;
    public async Task<Result<FacilityDto>> Handle(CreateFacilityCommand request, CancellationToken ct)
        => await _service.CreateAsync(request.Dto, ct);
}
