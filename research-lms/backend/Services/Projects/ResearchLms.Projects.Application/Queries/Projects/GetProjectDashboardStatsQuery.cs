using MediatR;
using ResearchLms.Projects.Application.DTOs;

namespace ResearchLms.Projects.Application.Queries.Projects;

public record GetProjectDashboardStatsQuery : IRequest<ProjectDashboardStatsDto>;
