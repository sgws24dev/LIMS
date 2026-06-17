using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Domain.Entities;

public class PricingModel : BaseEntity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public PricingModelType ModelType { get; private set; }
    public DateTime EffectiveFrom { get; private set; }
    public DateTime? EffectiveTo { get; private set; }
    public bool IsActive { get; private set; }

    private readonly List<RateTable> _rateTables = new();
    public IReadOnlyCollection<RateTable> RateTables => _rateTables.AsReadOnly();

    private PricingModel() { Name = null!; }

    public PricingModel(string name, string? description, PricingModelType modelType, DateTime effectiveFrom, DateTime? effectiveTo, string createdBy)
    {
        Name = name;
        Description = description;
        ModelType = modelType;
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        IsActive = true;
        MarkCreated(createdBy);
    }

    public void Update(string name, string? description, PricingModelType modelType, DateTime effectiveFrom, DateTime? effectiveTo, string modifiedBy)
    {
        Name = name;
        Description = description;
        ModelType = modelType;
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        MarkUpdated(modifiedBy);
    }

    public void ToggleActive(string modifiedBy)
    {
        IsActive = !IsActive;
        MarkUpdated(modifiedBy);
    }

    public void AddRateTable(RateTable rateTable)
    {
        _rateTables.Add(rateTable);
    }
}
