using MediatR;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public record CancelPurchaseOrderCommand(
    Guid PurchaseOrderId,
    string Reason
) : IRequest<Unit>;
