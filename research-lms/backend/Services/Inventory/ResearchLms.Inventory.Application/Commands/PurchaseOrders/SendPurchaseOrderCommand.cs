using MediatR;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public record SendPurchaseOrderCommand(Guid PurchaseOrderId) : IRequest<Unit>;
