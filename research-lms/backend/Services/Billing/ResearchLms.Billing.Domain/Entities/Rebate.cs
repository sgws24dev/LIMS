using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Domain.Entities;

public enum RebateType
{
    Percentage,
    Fixed,
    Volume
}

public class Rebate : BaseEntity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public RebateType RebateType { get; private set; }
    public decimal Value { get; private set; }
    public decimal? MinSpendAmount { get; private set; }
    public decimal? MaxDiscountAmount { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime ValidFrom { get; private set; }
    public DateTime? ValidTo { get; private set; }

    private Rebate() { Name = null!; }

    public Rebate(string name, string? description, RebateType rebateType, decimal value, decimal? minSpendAmount, decimal? maxDiscountAmount, DateTime validFrom, DateTime? validTo, string createdBy)
    {
        Name = name;
        Description = description;
        RebateType = rebateType;
        Value = value;
        MinSpendAmount = minSpendAmount;
        MaxDiscountAmount = maxDiscountAmount;
        IsActive = true;
        ValidFrom = validFrom;
        ValidTo = validTo;
        MarkCreated(createdBy);
    }
}
