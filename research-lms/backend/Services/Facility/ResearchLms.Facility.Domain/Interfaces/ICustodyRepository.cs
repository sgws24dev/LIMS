using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Domain.Interfaces;

public interface ICustodyRepository
{
    Task<CustodyEvent?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IReadOnlyList<CustodyEvent> Items, int TotalCount)> GetChainAsync(
        Guid assetId, int page = 1, int pageSize = 20, CancellationToken ct = default);
    Task<CustodyEvent?> GetCurrentCustodianAsync(Guid assetId, CancellationToken ct = default);
    Task AddAsync(CustodyEvent custodyEvent, CancellationToken ct = default);
}
