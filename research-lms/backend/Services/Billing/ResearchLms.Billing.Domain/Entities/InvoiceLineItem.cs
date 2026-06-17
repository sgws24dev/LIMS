using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Domain.Entities;

public class InvoiceLineItem : BaseEntity
{
    public Guid InvoiceId { get; private set; }
    public string Description { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal DiscountPercent { get; private set; }
    public decimal TaxRate { get; private set; }
    public decimal LineTotal { get; private set; }
    public string? ReferenceType { get; private set; }
    public Guid? ReferenceId { get; private set; }

    public Invoice Invoice { get; private set; } = null!;

    private InvoiceLineItem() { Description = null!; }

    public InvoiceLineItem(
        Guid invoiceId,
        string description,
        decimal quantity,
        decimal unitPrice,
        decimal discountPercent,
        decimal taxRate,
        string? referenceType,
        Guid? referenceId,
        string createdBy)
    {
        InvoiceId = invoiceId;
        Description = description;
        Quantity = quantity;
        UnitPrice = unitPrice;
        DiscountPercent = discountPercent;
        TaxRate = taxRate;
        LineTotal = CalculateLineTotal(quantity, unitPrice, discountPercent, taxRate);
        ReferenceType = referenceType;
        ReferenceId = referenceId;
        MarkCreated(createdBy);
    }

    private static decimal CalculateLineTotal(decimal quantity, decimal unitPrice, decimal discountPercent, decimal taxRate)
    {
        var subtotal = quantity * unitPrice;
        var discount = subtotal * discountPercent / 100;
        var afterDiscount = subtotal - discount;
        var tax = afterDiscount * taxRate / 100;
        return afterDiscount + tax;
    }
}
