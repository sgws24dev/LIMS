using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.ValueObjects;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IRebateService
{
    Task<decimal> CalculateRebateAsync(decimal subtotal, string? rebateCode = null, CancellationToken ct = default);
    Task<IReadOnlyList<Rebate>> GetApplicableRebatesAsync(decimal subtotal, CancellationToken ct = default);
}
