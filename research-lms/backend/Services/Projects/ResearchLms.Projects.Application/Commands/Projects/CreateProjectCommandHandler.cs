using MediatR;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Commands.Projects;

public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, Guid>
{
    private readonly IProjectRepository _repository;

    public CreateProjectCommandHandler(IProjectRepository repository) => _repository = repository;

    public async Task<Guid> Handle(CreateProjectCommand request, CancellationToken ct)
    {
        var project = new Project(
            request.Name, request.Description, request.Priority,
            request.StartDate, request.EndDate, request.Budget,
            request.ProjectManagerId, request.ProjectManagerName);
        await _repository.AddAsync(project, ct);
        return project.Id;
    }
}
