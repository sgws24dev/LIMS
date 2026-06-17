using MediatR;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public class SubmitPurchaseOrderCommandHandler : IRequestHandler<SubmitPurchaseOrderCommand, Unit>
{
    private readonly IPurchaseOrderRepository _poRepo;

    public SubmitPurchaseOrderCommandHandler(IPurchaseOrderRepository poRepo)
    {
        _poRepo = poRepo;
    }

    public async Task<Unit> Handle(SubmitPurchaseOrderCommand request, CancellationToken ct)
    {
        var po = await _poRepo.GetByIdAsync(request.PurchaseOrderId, ct)
            ?? throw new KeyNotFoundException("Purchase order not found.");

        po.UpdateStatus(PurchaseOrderStatus.PendingApproval);
        await _poRepo.UpdateAsync(po, ct);
        return Unit.Value;
    }
}
