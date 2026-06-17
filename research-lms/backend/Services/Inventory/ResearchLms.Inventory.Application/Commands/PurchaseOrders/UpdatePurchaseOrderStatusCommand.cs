using MediatR;
using ResearchLms.Inventory.Domain.Enums;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public record UpdatePurchaseOrderStatusCommand(
    Guid PurchaseOrderId,
    PurchaseOrderStatus NewStatus
) : IRequest<Unit>;
