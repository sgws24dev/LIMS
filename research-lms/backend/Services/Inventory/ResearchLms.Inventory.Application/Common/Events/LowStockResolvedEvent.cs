namespace ResearchLms.Inventory.Application.Common.Events;

public record LowStockResolvedEvent(
    Guid ItemId,
    Guid TenantId,
    string ItemName
);
