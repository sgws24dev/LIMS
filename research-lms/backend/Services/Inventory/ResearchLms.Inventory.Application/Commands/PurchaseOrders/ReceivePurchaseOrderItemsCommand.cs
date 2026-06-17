using MediatR;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public record LineReceiptInput(Guid LineId, decimal QuantityReceived);

public record ReceivePurchaseOrderItemsCommand(
    Guid PurchaseOrderId,
    IEnumerable<LineReceiptInput> ReceivedLines,
    Guid TransactedById,
    string TransactedByName
) : IRequest<Unit>;
