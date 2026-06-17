using ResearchLms.Projects.Domain.Entities;

namespace ResearchLms.Projects.Domain.Interfaces;

public interface IIssueSyncService
{
    string ProviderName { get; }
    Task<ExternalIssueRef> PushIssueAsync(Issue issue, CancellationToken ct = default);
    Task<bool> PullIssueAsync(Issue issue, CancellationToken ct = default);
    Task<IssueSyncResult> SyncProjectAsync(Guid projectId, CancellationToken ct = default);
}

public record ExternalIssueRef(
    string ExternalId,
    string ExternalUrl,
    string Provider
);

public record IssueSyncResult(
    int Pushed,
    int Pulled,
    int Failed,
    IEnumerable<string> Errors
);
