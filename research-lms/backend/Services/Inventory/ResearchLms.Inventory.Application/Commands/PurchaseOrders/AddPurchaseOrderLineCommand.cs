using MediatR;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public record AddPurchaseOrderLineCommand(
    Guid PurchaseOrderId,
    Guid InventoryItemId,
    string? Description,
    decimal QuantityOrdered,
    decimal UnitPrice,
    string? Notes
) : IRequest<Unit>;
