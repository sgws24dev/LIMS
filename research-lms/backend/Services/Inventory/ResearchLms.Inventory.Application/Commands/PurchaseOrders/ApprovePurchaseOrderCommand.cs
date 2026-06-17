using MediatR;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public record ApprovePurchaseOrderCommand(
    Guid PurchaseOrderId,
    Guid ApprovedById,
    string ApprovedByName
) : IRequest<Unit>;
