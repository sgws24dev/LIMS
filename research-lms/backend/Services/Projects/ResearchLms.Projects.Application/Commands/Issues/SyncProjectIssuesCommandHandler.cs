using MediatR;
using ResearchLms.Projects.Application.DTOs;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Commands.Issues;

public class SyncProjectIssuesCommandHandler : IRequestHandler<SyncProjectIssuesCommand, IssueSyncResultDto>
{
    private readonly IIssueRepository _issueRepo;
    private readonly IEnumerable<IIssueSyncService> _syncServices;

    public SyncProjectIssuesCommandHandler(IIssueRepository issueRepo, IEnumerable<IIssueSyncService> syncServices)
    {
        _issueRepo = issueRepo;
        _syncServices = syncServices;
    }

    public async Task<IssueSyncResultDto> Handle(SyncProjectIssuesCommand request, CancellationToken ct)
    {
        var service = _syncServices.FirstOrDefault(s =>
            s.ProviderName.Equals(request.Provider, StringComparison.OrdinalIgnoreCase))
            ?? throw new InvalidOperationException($"Sync provider '{request.Provider}' not registered.");

        var issues = await _issueRepo.GetPagedAsync(
            null, null, null, request.ProjectId, null, null, null, 1, 1000, ct);

        var errors = new List<string>();
        var pushed = 0;
        var pulled = 0;

        foreach (var issue in issues.Items)
        {
            try
            {
                var result = await service.PushIssueAsync(issue, ct);
                issue.SetExternalRef(result.ExternalId, result.ExternalUrl, result.Provider);
                await _issueRepo.UpdateAsync(issue, ct);
                pushed++;
            }
            catch (Exception ex)
            {
                errors.Add($"Issue {issue.Id}: {ex.Message}");
            }
        }

        return new IssueSyncResultDto(pushed, pulled, errors.Count, errors);
    }
}
