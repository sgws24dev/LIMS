using MediatR;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Commands.Issues;

public class CreateIssueCommandHandler : IRequestHandler<CreateIssueCommand, Guid>
{
    private readonly IIssueRepository _repository;

    public CreateIssueCommandHandler(IIssueRepository repository) => _repository = repository;

    public async Task<Guid> Handle(CreateIssueCommand request, CancellationToken ct)
    {
        var issue = new Issue(
            request.Title, request.Description, request.Severity,
            request.Type, request.Priority, request.ProjectId,
            request.WorkOrderId, request.AssignedToId, request.AssignedToName,
            request.ReportedById, request.ReportedByName,
            request.DueDate, request.Tags);
        await _repository.AddAsync(issue, ct);
        return issue.Id;
    }
}
