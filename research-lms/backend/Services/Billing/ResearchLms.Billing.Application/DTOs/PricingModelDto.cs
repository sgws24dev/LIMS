namespace ResearchLms.Billing.Application.DTOs;

public class PricingModelDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ModelType { get; set; } = string.Empty;
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public bool IsActive { get; set; }
    public List<RateTableDto> RateTables { get; set; } = new();
}

public class RateTableDto
{
    public Guid Id { get; set; }
    public string CustomerType { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public decimal? MinQuantity { get; set; }
    public decimal? MaxQuantity { get; set; }
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
}

public class RebateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string RebateType { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public decimal? MinSpendAmount { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public bool IsActive { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
}

public class CreditDto
{
    public Guid Id { get; set; }
    public Guid InstitutionId { get; set; }
    public decimal Balance { get; set; }
    public string Currency { get; set; } = string.Empty;
}

public class TaxCodeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Country { get; set; } = string.Empty;
    public string? Region { get; set; }
    public decimal Rate { get; set; }
    public bool IsDefault { get; set; }
    public bool IsCompound { get; set; }
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
}

public class ErpSyncLogDto
{
    public Guid Id { get; set; }
    public Guid InvoiceId { get; set; }
    public string Direction { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public int AttemptCount { get; set; }
    public DateTime? LastAttemptedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class FinancialDashboardDto
{
    public decimal TotalRevenueMonth { get; set; }
    public decimal OutstandingReceivables { get; set; }
    public decimal OverdueAmount { get; set; }
    public decimal AvgDaysToPay { get; set; }
    public List<MonthlyRevenueDto> RevenueByMonth { get; set; } = new();
    public List<CategoryRevenueDto> RevenueByCategory { get; set; } = new();
    public List<AgingBucketDto> OutstandingByAging { get; set; } = new();
    public List<InvoiceDto> RecentTransactions { get; set; } = new();
}

public class MonthlyRevenueDto
{
    public string Month { get; set; } = string.Empty;
    public decimal CurrentYear { get; set; }
    public decimal PreviousYear { get; set; }
}

public class CategoryRevenueDto
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class AgingBucketDto
{
    public string Bucket { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class PriceBreakdownDto
{
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
    public List<PriceLineItemDto> LineItems { get; set; } = new();
}

public class PriceLineItemDto
{
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal TaxRate { get; set; }
    public decimal LineTotal { get; set; }
}

public class ExchangeRateDto
{
    public Guid Id { get; set; }
    public string FromCurrency { get; set; } = string.Empty;
    public string ToCurrency { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
}

public class ReconciliationDto
{
    public Guid Id { get; set; }
    public Guid InvoiceId { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime TransactionDate { get; set; }
    public DateTime? MatchedAt { get; set; }
    public string? Notes { get; set; }
}
