using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Domain.Entities;

public class RateTable : BaseEntity
{
    public Guid PricingModelId { get; private set; }
    public CustomerType CustomerType { get; private set; }
    public decimal Rate { get; private set; }
    public decimal? MinQuantity { get; private set; }
    public decimal? MaxQuantity { get; private set; }
    public DateTime EffectiveFrom { get; private set; }
    public DateTime? EffectiveTo { get; private set; }

    public PricingModel PricingModel { get; private set; } = null!;

    private RateTable() { }

    public RateTable(Guid pricingModelId, CustomerType customerType, decimal rate, decimal? minQuantity, decimal? maxQuantity, DateTime effectiveFrom, DateTime? effectiveTo, string createdBy)
    {
        PricingModelId = pricingModelId;
        CustomerType = customerType;
        Rate = rate;
        MinQuantity = minQuantity;
        MaxQuantity = maxQuantity;
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        MarkCreated(createdBy);
    }
}
