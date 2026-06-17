using MediatR;
using ResearchLms.Inventory.Application.DTOs;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Queries.PurchaseOrders;

public record GetPurchaseOrdersQuery(
    PurchaseOrderStatus? Status,
    Guid? VendorId,
    DateTime? FromDate,
    DateTime? ToDate,
    int Page,
    int PageSize
) : IRequest<PagedResult<PurchaseOrderDto>>;
