using MediatR;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Commands.Projects;

public class ArchiveProjectCommandHandler : IRequestHandler<ArchiveProjectCommand, Unit>
{
    private readonly IProjectRepository _repository;

    public ArchiveProjectCommandHandler(IProjectRepository repository) => _repository = repository;

    public async Task<Unit> Handle(ArchiveProjectCommand request, CancellationToken ct)
    {
        var project = await _repository.GetByIdAsync(request.ProjectId, ct)
            ?? throw new KeyNotFoundException("Project not found.");
        project.Archive();
        await _repository.UpdateAsync(project, ct);
        return Unit.Value;
    }
}
