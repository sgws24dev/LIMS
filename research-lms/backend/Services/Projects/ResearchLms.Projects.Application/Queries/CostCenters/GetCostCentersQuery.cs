using MediatR;
using ResearchLms.Projects.Application.DTOs;

namespace ResearchLms.Projects.Application.Queries.CostCenters;

public record GetCostCentersQuery(
    bool ActiveOnly,
    int? FiscalYear
) : IRequest<IEnumerable<CostCenterDto>>;
