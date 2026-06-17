using MediatR;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public class UpdatePurchaseOrderStatusCommandHandler : IRequestHandler<UpdatePurchaseOrderStatusCommand, Unit>
{
    private readonly IPurchaseOrderRepository _poRepo;

    public UpdatePurchaseOrderStatusCommandHandler(IPurchaseOrderRepository poRepo)
    {
        _poRepo = poRepo;
    }

    public async Task<Unit> Handle(UpdatePurchaseOrderStatusCommand request, CancellationToken ct)
    {
        var po = await _poRepo.GetByIdAsync(request.PurchaseOrderId, ct)
            ?? throw new KeyNotFoundException("Purchase order not found.");

        if (!po.CanTransitionTo(request.NewStatus))
            throw new InvalidOperationException(
                $"Cannot transition from {po.Status} to {request.NewStatus}.");

        po.UpdateStatus(request.NewStatus);
        await _poRepo.UpdateAsync(po, ct);
        return Unit.Value;
    }
}
