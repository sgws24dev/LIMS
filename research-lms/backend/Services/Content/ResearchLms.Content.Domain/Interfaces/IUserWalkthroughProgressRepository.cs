using ResearchLms.Content.Domain.Entities;

namespace ResearchLms.Content.Domain.Interfaces;

public interface IUserWalkthroughProgressRepository
{
    Task<bool> IsCompletedAsync(Guid tenantId, Guid userId, Guid walkthroughId, CancellationToken ct = default);
    Task MarkCompletedAsync(Guid tenantId, Guid userId, Guid walkthroughId, CancellationToken ct = default);
    Task MarkSkippedAsync(Guid tenantId, Guid userId, Guid walkthroughId, CancellationToken ct = default);
    Task SaveProgressAsync(Guid tenantId, Guid userId, Guid walkthroughId, int stepIndex, CancellationToken ct = default);
    Task<UserWalkthroughProgress?> GetProgressAsync(Guid tenantId, Guid userId, Guid walkthroughId, CancellationToken ct = default);
    Task<IReadOnlyList<Guid>> GetCompletedWalkthroughIdsAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
}
