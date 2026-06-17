using MediatR;
using ResearchLms.Projects.Application.DTOs;

namespace ResearchLms.Projects.Application.Queries.CostCenters;

public record GetCostCenterSpendQuery(Guid CostCenterId) : IRequest<CostCenterSpendSummaryDto>;
