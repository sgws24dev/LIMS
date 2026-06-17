using MediatR;
using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.StockMovements;

public class RecordStockReceiptCommandHandler : IRequestHandler<RecordStockReceiptCommand, Guid>
{
    private readonly IInventoryItemRepository _itemRepo;
    private readonly IStockTransactionRepository _transactionRepo;

    public RecordStockReceiptCommandHandler(
        IInventoryItemRepository itemRepo,
        IStockTransactionRepository transactionRepo)
    {
        _itemRepo = itemRepo;
        _transactionRepo = transactionRepo;
    }

    public async Task<Guid> Handle(RecordStockReceiptCommand request, CancellationToken ct)
    {
        var item = await _itemRepo.GetByIdAsync(request.ItemId, ct)
            ?? throw new KeyNotFoundException("Item not found.");

        var quantityBefore = item.QuantityOnHand;
        item.AdjustStock(request.Quantity, "Stock receipt");
        item.UpdateUnitCost(request.UnitCost);

        var transaction = new StockTransaction(
            item.Id, StockTransactionType.Receipt, request.Quantity,
            quantityBefore, item.QuantityOnHand, request.UnitCost,
            request.ReferenceId.HasValue ? "PurchaseOrder" : null,
            request.ReferenceId,
            request.Notes ?? "Stock receipt",
            request.TransactedById, request.TransactedByName);

        await _itemRepo.UpdateAsync(item, ct);
        await _transactionRepo.AddAsync(transaction, ct);
        return transaction.Id;
    }
}
