namespace ResearchLms.Billing.Domain.ValueObjects;

public class PriceBreakdown
{
    public decimal Subtotal { get; }
    public decimal DiscountAmount { get; }
    public decimal TaxAmount { get; }
    public decimal Total { get; }
    public IReadOnlyList<PriceLineItem> LineItems { get; }

    public PriceBreakdown(decimal subtotal, decimal discountAmount, decimal taxAmount, decimal total, List<PriceLineItem> lineItems)
    {
        Subtotal = subtotal;
        DiscountAmount = discountAmount;
        TaxAmount = taxAmount;
        Total = total;
        LineItems = lineItems.AsReadOnly();
    }
}

public class PriceLineItem
{
    public string Description { get; }
    public decimal Quantity { get; }
    public decimal UnitPrice { get; }
    public decimal DiscountPercent { get; }
    public decimal TaxRate { get; }
    public decimal LineTotal { get; }

    public PriceLineItem(string description, decimal quantity, decimal unitPrice, decimal discountPercent, decimal taxRate, decimal lineTotal)
    {
        Description = description;
        Quantity = quantity;
        UnitPrice = unitPrice;
        DiscountPercent = discountPercent;
        TaxRate = taxRate;
        LineTotal = lineTotal;
    }
}
