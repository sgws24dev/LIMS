using MediatR;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public class RemovePurchaseOrderLineCommandHandler : IRequestHandler<RemovePurchaseOrderLineCommand, Unit>
{
    private readonly IPurchaseOrderRepository _poRepo;

    public RemovePurchaseOrderLineCommandHandler(IPurchaseOrderRepository poRepo)
    {
        _poRepo = poRepo;
    }

    public async Task<Unit> Handle(RemovePurchaseOrderLineCommand request, CancellationToken ct)
    {
        var po = await _poRepo.GetByIdWithLinesAsync(request.PurchaseOrderId, ct)
            ?? throw new KeyNotFoundException("Purchase order not found.");

        var line = po.Lines.FirstOrDefault(i => i.Id == request.LineId)
            ?? throw new KeyNotFoundException("Line item not found.");

        po.RemoveItem(line);
        await _poRepo.UpdateAsync(po, ct);
        return Unit.Value;
    }
}
