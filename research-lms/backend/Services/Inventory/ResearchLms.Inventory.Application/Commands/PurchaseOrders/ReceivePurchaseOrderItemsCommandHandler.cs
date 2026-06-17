using MediatR;
using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public class ReceivePurchaseOrderItemsCommandHandler : IRequestHandler<ReceivePurchaseOrderItemsCommand, Unit>
{
    private readonly IPurchaseOrderRepository _poRepo;
    private readonly IInventoryItemRepository _itemRepo;
    private readonly IStockTransactionRepository _transactionRepo;

    public ReceivePurchaseOrderItemsCommandHandler(
        IPurchaseOrderRepository poRepo,
        IInventoryItemRepository itemRepo,
        IStockTransactionRepository transactionRepo)
    {
        _poRepo = poRepo;
        _itemRepo = itemRepo;
        _transactionRepo = transactionRepo;
    }

    public async Task<Unit> Handle(ReceivePurchaseOrderItemsCommand request, CancellationToken ct)
    {
        var po = await _poRepo.GetByIdWithLinesAsync(request.PurchaseOrderId, ct)
            ?? throw new KeyNotFoundException("Purchase order not found.");

        if (po.Status is not (PurchaseOrderStatus.Ordered or PurchaseOrderStatus.PartiallyReceived))
            throw new InvalidOperationException(
                "Can only receive items on Ordered or PartiallyReceived purchase orders.");

        foreach (var receipt in request.ReceivedLines)
        {
            var line = po.Lines.FirstOrDefault(l => l.Id == receipt.LineId)
                ?? throw new KeyNotFoundException($"PO line {receipt.LineId} not found.");

            if (receipt.QuantityReceived <= 0) continue;

            if (line.QuantityReceived + receipt.QuantityReceived > line.QuantityOrdered)
                throw new InvalidOperationException(
                    $"Received quantity for item exceeds ordered quantity.");

            line.UpdateQuantityReceived(line.QuantityReceived + receipt.QuantityReceived);

            var item = await _itemRepo.GetByIdAsync(line.InventoryItemId, ct);
            if (item is not null)
            {
                var quantityBefore = item.QuantityOnHand;
                item.AdjustStock(receipt.QuantityReceived, $"Received via PO {po.PONumber}");
                item.UpdateUnitCost(line.UnitPrice);

                var transaction = new StockTransaction(
                    item.Id, StockTransactionType.Receipt, receipt.QuantityReceived,
                    quantityBefore, item.QuantityOnHand, line.UnitPrice,
                    "PurchaseOrder", po.Id,
                    $"Received via PO {po.PONumber}",
                    request.TransactedById, request.TransactedByName);

                await _transactionRepo.AddAsync(transaction, ct);
                await _itemRepo.UpdateAsync(item, ct);
            }
        }

        var allReceived = po.Lines.All(l => l.IsFullyReceived);
        if (allReceived)
            po.UpdateStatus(PurchaseOrderStatus.FullyReceived);
        else
            po.UpdateStatus(PurchaseOrderStatus.PartiallyReceived);

        await _poRepo.UpdateAsync(po, ct);
        return Unit.Value;
    }
}
