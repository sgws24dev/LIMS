using MediatR;
using ResearchLms.Inventory.Application.DTOs;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Queries.PurchaseOrders;

public class GetPurchaseOrderByIdQueryHandler : IRequestHandler<GetPurchaseOrderByIdQuery, PurchaseOrderDetailDto?>
{
    private readonly IPurchaseOrderRepository _repository;

    public GetPurchaseOrderByIdQueryHandler(IPurchaseOrderRepository repository) => _repository = repository;

    public async Task<PurchaseOrderDetailDto?> Handle(GetPurchaseOrderByIdQuery request, CancellationToken ct)
    {
        var po = await _repository.GetByIdWithLinesAsync(request.PurchaseOrderId, ct);
        if (po is null) return null;

        return new PurchaseOrderDetailDto(
            po.Id, po.PONumber, po.VendorId, po.Vendor.Name,
            po.Status.ToString(), po.OrderedAt,
            po.ExpectedDeliveryDate, null, null, null,
            po.Notes, null, null, null, null, null,
            po.Subtotal, po.Tax,
            po.TotalAmount, po.CreatedAt, po.UpdatedAt ?? po.CreatedAt,
            po.Lines.Select(i => new PurchaseOrderLineDto(
                i.Id, i.InventoryItemId, i.InventoryItem.Name,
                i.InventoryItem.SKU, null,
                i.QuantityOrdered, i.QuantityReceived, i.QuantityPending,
                i.UnitPrice, i.TotalPrice, i.IsFullyReceived, null)));
    }
}
