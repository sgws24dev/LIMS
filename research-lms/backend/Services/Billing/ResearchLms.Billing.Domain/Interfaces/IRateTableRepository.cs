using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IRateTableRepository
{
    Task<IReadOnlyList<RateTable>> GetByPricingModelIdAsync(Guid pricingModelId, CancellationToken ct = default);
    Task<RateTable?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(RateTable rateTable, CancellationToken ct = default);
    Task UpdateAsync(RateTable rateTable, CancellationToken ct = default);
}
