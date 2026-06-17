using MediatR;
using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public class AddPurchaseOrderLineCommandHandler : IRequestHandler<AddPurchaseOrderLineCommand, Unit>
{
    private readonly IPurchaseOrderRepository _poRepo;

    public AddPurchaseOrderLineCommandHandler(IPurchaseOrderRepository poRepo)
    {
        _poRepo = poRepo;
    }

    public async Task<Unit> Handle(AddPurchaseOrderLineCommand request, CancellationToken ct)
    {
        var po = await _poRepo.GetByIdWithLinesAsync(request.PurchaseOrderId, ct)
            ?? throw new KeyNotFoundException("Purchase order not found.");

        var poLine = new PurchaseOrderLine(
            po.Id, request.InventoryItemId, request.Description,
            request.QuantityOrdered, request.UnitPrice, request.Notes);

        po.AddItem(poLine);
        await _poRepo.UpdateAsync(po, ct);
        return Unit.Value;
    }
}
