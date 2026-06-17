using Microsoft.Extensions.Logging;
using ResearchLms.Projects.Domain.Interfaces;

namespace ResearchLms.Projects.Infrastructure.BackgroundJobs;

public class IssueSyncJob : IIssueSyncJob
{
    private readonly IIssueRepository _issueRepo;
    private readonly IEnumerable<IIssueSyncService> _syncServices;
    private readonly ILogger<IssueSyncJob> _logger;

    public IssueSyncJob(
        IIssueRepository issueRepo,
        IEnumerable<IIssueSyncService> syncServices,
        ILogger<IssueSyncJob> logger)
    {
        _issueRepo = issueRepo;
        _syncServices = syncServices;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        var linkedIssues = await _issueRepo.GetAllLinkedAsync(CancellationToken.None);

        foreach (var issue in linkedIssues)
        {
            var service = _syncServices.FirstOrDefault(s =>
                s.ProviderName.Equals(issue.ExternalProvider, StringComparison.OrdinalIgnoreCase));
            if (service is null) continue;

            try
            {
                var updated = await service.PullIssueAsync(issue, CancellationToken.None);
                if (updated)
                    await _issueRepo.UpdateAsync(issue, CancellationToken.None);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sync failed for Issue {IssueId}", issue.Id);
            }
        }
    }
}
