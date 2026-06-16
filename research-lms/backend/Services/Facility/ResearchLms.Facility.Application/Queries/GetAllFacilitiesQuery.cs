using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Application.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public record GetAllFacilitiesQuery(string? Search, string? Type, int Page = 1, int PageSize = 20)
    : IRequest<Result<(IReadOnlyList<FacilityDto> Items, int TotalCount)>>;

public class GetAllFacilitiesHandler : IRequestHandler<GetAllFacilitiesQuery, Result<(IReadOnlyList<FacilityDto> Items, int TotalCount)>>
{
    private readonly IFacilityService _service;
    public GetAllFacilitiesHandler(IFacilityService service) => _service = service;
    public async Task<Result<(IReadOnlyList<FacilityDto> Items, int TotalCount)>> Handle(GetAllFacilitiesQuery request, CancellationToken ct)
        => await _service.GetAllAsync(request.Search, request.Type, request.Page, request.PageSize, ct);
}
