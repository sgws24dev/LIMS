using ResearchLms.Billing.Domain.ValueObjects;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface IPricingService
{
    Task<PriceBreakdown> CalculatePriceAsync(
        Guid pricingModelId,
        decimal quantity,
        int? duration,
        string customerType,
        Dictionary<string, object>? context = null,
        CancellationToken ct = default);
}
