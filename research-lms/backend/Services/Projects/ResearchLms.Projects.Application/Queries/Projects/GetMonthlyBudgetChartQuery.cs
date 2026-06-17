using MediatR;
using ResearchLms.Projects.Application.DTOs;

namespace ResearchLms.Projects.Application.Queries.Projects;

public record GetMonthlyBudgetChartQuery(int MonthsBack = 6) : IRequest<IEnumerable<MonthlyBudgetDataPoint>>;
