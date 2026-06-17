using MediatR;
using ResearchLms.Projects.Application.DTOs;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Application.Commands.Issues;

public class SyncIssueToExternalCommandHandler : IRequestHandler<SyncIssueToExternalCommand, ExternalIssueRefDto>
{
    private readonly IIssueRepository _issueRepo;
    private readonly IEnumerable<IIssueSyncService> _syncServices;

    public SyncIssueToExternalCommandHandler(IIssueRepository issueRepo, IEnumerable<IIssueSyncService> syncServices)
    {
        _issueRepo = issueRepo;
        _syncServices = syncServices;
    }

    public async Task<ExternalIssueRefDto> Handle(SyncIssueToExternalCommand request, CancellationToken ct)
    {
        var issue = await _issueRepo.GetByIdAsync(request.IssueId, ct)
            ?? throw new KeyNotFoundException("Issue not found.");

        var service = _syncServices.FirstOrDefault(s =>
            s.ProviderName.Equals(request.Provider, StringComparison.OrdinalIgnoreCase))
            ?? throw new InvalidOperationException($"Sync provider '{request.Provider}' not registered.");

        var result = await service.PushIssueAsync(issue, ct);
        issue.SetExternalRef(result.ExternalId, result.ExternalUrl, result.Provider);
        await _issueRepo.UpdateAsync(issue, ct);

        return new ExternalIssueRefDto(result.ExternalId, result.ExternalUrl, result.Provider);
    }
}
