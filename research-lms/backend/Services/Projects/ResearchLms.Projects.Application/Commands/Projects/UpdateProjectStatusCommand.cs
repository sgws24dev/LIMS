using MediatR;
using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Application.Commands.Projects;

public record UpdateProjectStatusCommand(
    Guid ProjectId,
    ProjectStatus NewStatus,
    Guid UpdatedById
) : IRequest<Unit>;
