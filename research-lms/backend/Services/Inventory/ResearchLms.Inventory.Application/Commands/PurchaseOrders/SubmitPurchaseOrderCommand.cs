using MediatR;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public record SubmitPurchaseOrderCommand(
    Guid PurchaseOrderId
) : IRequest<Unit>;
