using MediatR;
using ResearchLms.Inventory.Application.DTOs;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Queries.PurchaseOrders;

public class GetPurchaseOrdersQueryHandler : IRequestHandler<GetPurchaseOrdersQuery, PagedResult<PurchaseOrderDto>>
{
    private readonly IPurchaseOrderRepository _repository;

    public GetPurchaseOrdersQueryHandler(IPurchaseOrderRepository repository) => _repository = repository;

    public async Task<PagedResult<PurchaseOrderDto>> Handle(GetPurchaseOrdersQuery request, CancellationToken ct)
    {
        var result = await _repository.GetPagedAsync(
            request.Status, request.VendorId, request.FromDate, request.ToDate,
            request.Page, request.PageSize, ct);

        return new PagedResult<PurchaseOrderDto>(
            result.Items.Select(po => new PurchaseOrderDto(
                po.Id, po.PONumber, po.VendorId, po.Vendor.Name,
                po.Status.ToString(), po.OrderedAt,
                po.ExpectedDeliveryDate, po.Subtotal, po.Tax,
                po.TotalAmount, po.Lines.Count, po.Notes, po.CreatedAt)),
            result.TotalCount, result.Page, result.PageSize);
    }
}
