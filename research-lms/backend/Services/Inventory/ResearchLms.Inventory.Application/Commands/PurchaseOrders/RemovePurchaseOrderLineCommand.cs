using MediatR;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public record RemovePurchaseOrderLineCommand(
    Guid PurchaseOrderId,
    Guid LineId
) : IRequest<Unit>;
