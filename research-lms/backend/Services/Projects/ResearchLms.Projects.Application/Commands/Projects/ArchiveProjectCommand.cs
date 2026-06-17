using MediatR;

namespace ResearchLms.Projects.Application.Commands.Projects;

public record ArchiveProjectCommand(Guid ProjectId) : IRequest<Unit>;
