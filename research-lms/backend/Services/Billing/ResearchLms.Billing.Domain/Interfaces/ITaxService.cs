using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface ITaxService
{
    Task<decimal> CalculateTaxAsync(string country, string? region, decimal amount, CancellationToken ct = default);
    Task<IReadOnlyList<TaxCode>> GetApplicableTaxCodesAsync(string country, string? region, CancellationToken ct = default);
}
