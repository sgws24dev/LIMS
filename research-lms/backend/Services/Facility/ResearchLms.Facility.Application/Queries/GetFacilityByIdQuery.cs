using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public record GetFacilityByIdQuery(Guid Id) : IRequest<Result<FacilityDto>>;

public class GetFacilityByIdHandler : IRequestHandler<GetFacilityByIdQuery, Result<FacilityDto>>
{
    private readonly IFacilityService _service;
    public GetFacilityByIdHandler(IFacilityService service) => _service = service;
    public async Task<Result<FacilityDto>> Handle(GetFacilityByIdQuery request, CancellationToken ct)
        => await _service.GetByIdAsync(request.Id, ct);
}
