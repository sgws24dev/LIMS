using MediatR;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Commands.Issues;

public class UpdateIssueCommandHandler : IRequestHandler<UpdateIssueCommand, Unit>
{
    private readonly IIssueRepository _repository;

    public UpdateIssueCommandHandler(IIssueRepository repository) => _repository = repository;

    public async Task<Unit> Handle(UpdateIssueCommand request, CancellationToken ct)
    {
        var issue = await _repository.GetByIdAsync(request.IssueId, ct)
            ?? throw new KeyNotFoundException("Issue not found.");
        issue.Update(request.Title, request.Description, request.Severity,
            request.Type, request.Priority, request.ProjectId,
            request.WorkOrderId, request.AssignedToId, request.AssignedToName,
            request.DueDate, request.Tags);
        await _repository.UpdateAsync(issue, ct);
        return Unit.Value;
    }
}
