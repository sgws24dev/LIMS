using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Enums;

namespace ResearchLms.Projects.Domain.Interfaces;

public interface IIssueRepository
{
    Task<Issue?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<Issue>> GetPagedAsync(
        IssueStatus? status,
        IssueSeverity? severity,
        IssueType? type,
        Guid? projectId,
        Guid? workOrderId,
        Guid? assignedToId,
        Guid? reportedById,
        int page,
        int pageSize,
        CancellationToken ct = default);
    Task<Issue?> GetByExternalIdAsync(string externalId, string provider, CancellationToken ct = default);
    Task<IEnumerable<Issue>> GetAllLinkedAsync(CancellationToken ct = default);
    Task AddAsync(Issue issue, CancellationToken ct = default);
    Task UpdateAsync(Issue issue, CancellationToken ct = default);
}
