namespace ResearchLms.Scheduling.Domain.Entities;

public class ConsumableStockCache
{
    public Guid ItemId { get; set; }
    public Guid TenantId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public DateTime LastUpdatedAt { get; set; }
}
