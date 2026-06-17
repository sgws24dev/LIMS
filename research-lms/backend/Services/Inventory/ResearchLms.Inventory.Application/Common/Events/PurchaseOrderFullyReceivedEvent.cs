namespace ResearchLms.Inventory.Application.Common.Events;

public record PurchaseOrderFullyReceivedEvent(
    Guid PurchaseOrderId,
    Guid TenantId,
    string PONumber,
    Guid VendorId
);
