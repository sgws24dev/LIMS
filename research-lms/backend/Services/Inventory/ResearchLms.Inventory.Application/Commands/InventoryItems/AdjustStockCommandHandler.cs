using MediatR;
using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.InventoryItems;

public class AdjustStockCommandHandler : IRequestHandler<AdjustStockCommand, Unit>
{
    private readonly IInventoryItemRepository _itemRepo;
    private readonly IStockTransactionRepository _transactionRepo;

    public AdjustStockCommandHandler(
        IInventoryItemRepository itemRepo,
        IStockTransactionRepository transactionRepo)
    {
        _itemRepo = itemRepo;
        _transactionRepo = transactionRepo;
    }

    public async Task<Unit> Handle(AdjustStockCommand request, CancellationToken ct)
    {
        var item = await _itemRepo.GetByIdAsync(request.ItemId, ct)
            ?? throw new KeyNotFoundException("Inventory item not found.");

        var quantityBefore = item.QuantityOnHand;
        item.AdjustStock(request.Delta, request.Reason);

        var transactionType = request.Delta > 0
            ? StockTransactionType.Receipt
            : request.Delta < 0
                ? StockTransactionType.Adjustment
                : StockTransactionType.Adjustment;

        var transaction = new StockTransaction(
            item.Id, transactionType, Math.Abs(request.Delta),
            quantityBefore, item.QuantityOnHand, item.UnitCost,
            "ManualAdjustment", null, request.Reason,
            request.TransactedById, request.TransactedByName);

        await _itemRepo.UpdateAsync(item, ct);
        await _transactionRepo.AddAsync(transaction, ct);
        return Unit.Value;
    }
}
