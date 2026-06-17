using MediatR;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public class CancelPurchaseOrderCommandHandler : IRequestHandler<CancelPurchaseOrderCommand, Unit>
{
    private readonly IPurchaseOrderRepository _poRepo;

    public CancelPurchaseOrderCommandHandler(IPurchaseOrderRepository poRepo)
    {
        _poRepo = poRepo;
    }

    public async Task<Unit> Handle(CancelPurchaseOrderCommand request, CancellationToken ct)
    {
        var po = await _poRepo.GetByIdAsync(request.PurchaseOrderId, ct)
            ?? throw new KeyNotFoundException("Purchase order not found.");

        po.UpdateStatus(PurchaseOrderStatus.Cancelled);
        await _poRepo.UpdateAsync(po, ct);
        return Unit.Value;
    }
}
