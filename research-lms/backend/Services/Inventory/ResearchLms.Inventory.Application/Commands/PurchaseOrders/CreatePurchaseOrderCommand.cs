using MediatR;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public record PurchaseOrderLineInput(
    Guid InventoryItemId,
    string? Description,
    decimal QuantityOrdered,
    decimal UnitPrice,
    string? Notes
);

public record CreatePurchaseOrderCommand(
    Guid VendorId,
    DateTime? ExpectedDeliveryDate,
    string? CostCenterId,
    string? ShippingAddress,
    string? Notes,
    Guid? RequestedById,
    string? RequestedByName,
    List<PurchaseOrderLineInput> Lines
) : IRequest<Guid>;
