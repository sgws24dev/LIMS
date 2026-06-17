using MediatR;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public class ApprovePurchaseOrderCommandHandler : IRequestHandler<ApprovePurchaseOrderCommand, Unit>
{
    private readonly IPurchaseOrderRepository _poRepo;

    public ApprovePurchaseOrderCommandHandler(IPurchaseOrderRepository poRepo)
    {
        _poRepo = poRepo;
    }

    public async Task<Unit> Handle(ApprovePurchaseOrderCommand request, CancellationToken ct)
    {
        var po = await _poRepo.GetByIdAsync(request.PurchaseOrderId, ct)
            ?? throw new KeyNotFoundException("Purchase order not found.");

        po.UpdateStatus(PurchaseOrderStatus.Approved);
        await _poRepo.UpdateAsync(po, ct);
        return Unit.Value;
    }
}
