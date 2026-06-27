using ResearchLms.Content.Domain.Entities;

namespace ResearchLms.Content.Domain.Interfaces;

public interface IWalkthroughRepository
{
    Task<IReadOnlyList<Walkthrough>> GetActiveByRouteAsync(Guid tenantId, string route, CancellationToken ct = default);
    Task<IReadOnlyList<Walkthrough>> GetAllAsync(Guid tenantId, CancellationToken ct = default);
    Task<Walkthrough?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Walkthrough walkthrough, CancellationToken ct = default);
    Task UpdateAsync(Walkthrough walkthrough, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
