using MediatR;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Commands.Projects;

public class UpdateProjectCommandHandler : IRequestHandler<UpdateProjectCommand, Unit>
{
    private readonly IProjectRepository _repository;

    public UpdateProjectCommandHandler(IProjectRepository repository) => _repository = repository;

    public async Task<Unit> Handle(UpdateProjectCommand request, CancellationToken ct)
    {
        var project = await _repository.GetByIdAsync(request.ProjectId, ct)
            ?? throw new KeyNotFoundException("Project not found.");
        project.Update(request.Name, request.Description, request.Priority,
            request.StartDate, request.EndDate, request.Budget,
            request.ProjectManagerId, request.ProjectManagerName);
        await _repository.UpdateAsync(project, ct);
        return Unit.Value;
    }
}
