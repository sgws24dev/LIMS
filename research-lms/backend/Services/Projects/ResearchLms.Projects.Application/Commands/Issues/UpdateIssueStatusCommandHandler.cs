using MediatR;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Commands.Issues;

public class UpdateIssueStatusCommandHandler : IRequestHandler<UpdateIssueStatusCommand, Unit>
{
    private readonly IIssueRepository _repository;

    public UpdateIssueStatusCommandHandler(IIssueRepository repository) => _repository = repository;

    public async Task<Unit> Handle(UpdateIssueStatusCommand request, CancellationToken ct)
    {
        var issue = await _repository.GetByIdAsync(request.IssueId, ct)
            ?? throw new KeyNotFoundException("Issue not found.");
        if (!issue.CanTransitionTo(request.NewStatus))
            throw new InvalidOperationException(
                $"Cannot transition from {issue.Status} to {request.NewStatus}.");
        issue.UpdateStatus(request.NewStatus);
        await _repository.UpdateAsync(issue, ct);
        return Unit.Value;
    }
}
