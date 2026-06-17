using MediatR;
using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Application.Commands.Projects;

public record CreateProjectCommand(
    string Name,
    string? Description,
    Priority Priority,
    DateOnly? StartDate,
    DateOnly? EndDate,
    decimal Budget,
    Guid? ProjectManagerId,
    string? ProjectManagerName
) : IRequest<Guid>;
