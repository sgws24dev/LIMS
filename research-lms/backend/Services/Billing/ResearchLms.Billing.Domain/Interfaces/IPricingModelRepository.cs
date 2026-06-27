using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IPricingModelRepository
{
    Task<IReadOnlyList<PricingModel>> GetAllAsync(bool? isActive = null, CancellationToken ct = default);
    Task<PricingModel?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(PricingModel pricingModel, CancellationToken ct = default);
    Task UpdateAsync(PricingModel pricingModel, CancellationToken ct = default);
}
