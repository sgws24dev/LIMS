using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Domain.Entities;

public class TaxCode : BaseEntity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string Country { get; private set; }
    public string? Region { get; private set; }
    public decimal Rate { get; private set; }
    public bool IsDefault { get; private set; }
    public bool IsCompound { get; private set; }
    public DateTime EffectiveFrom { get; private set; }
    public DateTime? EffectiveTo { get; private set; }

    private TaxCode() { Name = null!; Country = null!; }

    public TaxCode(string name, string? description, string country, string? region, decimal rate, bool isDefault, bool isCompound, DateTime effectiveFrom, DateTime? effectiveTo, string createdBy)
    {
        Name = name;
        Description = description;
        Country = country;
        Region = region;
        Rate = rate;
        IsDefault = isDefault;
        IsCompound = isCompound;
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        MarkCreated(createdBy);
    }
}
