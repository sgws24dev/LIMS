using MediatR;
using ResearchLms.Projects.Application.DTOs;
using ResearchLms.Projects.Domain.Enums;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Queries.Projects;

public record GetProjectsQuery(
    ProjectStatus? Status,
    Guid? ProjectManagerId,
    bool IncludeArchived,
    int Page,
    int PageSize
) : IRequest<PagedResult<ProjectDto>>;
