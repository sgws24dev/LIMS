using MediatR;
using ResearchLms.Inventory.Application.DTOs;

namespace ResearchLms.Inventory.Application.Queries.PurchaseOrders;

public record GetPurchaseOrderByIdQuery(Guid PurchaseOrderId) : IRequest<PurchaseOrderDetailDto?>;
