namespace ResearchLms.Inventory.Application.Common.Events;

public record LowStockAlertEvent(
    Guid ItemId,
    Guid TenantId,
    string ItemName,
    string SKU,
    decimal QuantityOnHand,
    decimal ReorderPoint
);
