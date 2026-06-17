namespace ResearchLms.Inventory.Domain.Enums;

public enum PurchaseOrderStatus
{
    Draft,
    PendingApproval,
    Approved,
    Ordered,
    PartiallyReceived,
    FullyReceived,
    Cancelled
}
