using MediatR;
using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.StockMovements;

public class RecordStockMovementCommandHandler : IRequestHandler<RecordStockMovementCommand, Unit>
{
    private readonly IInventoryItemRepository _itemRepo;
    private readonly IStockTransactionRepository _transactionRepo;

    public RecordStockMovementCommandHandler(
        IInventoryItemRepository itemRepo,
        IStockTransactionRepository transactionRepo)
    {
        _itemRepo = itemRepo;
        _transactionRepo = transactionRepo;
    }

    public async Task<Unit> Handle(RecordStockMovementCommand request, CancellationToken ct)
    {
        var item = await _itemRepo.GetByIdAsync(request.InventoryItemId, ct)
            ?? throw new KeyNotFoundException("Inventory item not found.");

        var quantityBefore = item.QuantityOnHand;
        var effectiveDelta = request.TransactionType switch
        {
            StockTransactionType.Receipt or StockTransactionType.Return => request.Quantity,
            StockTransactionType.Issue or StockTransactionType.WriteOff => -request.Quantity,
            _ => request.Quantity
        };

        item.AdjustStock(effectiveDelta, request.Notes ?? "Stock movement");

        var transaction = new StockTransaction(
            item.Id, request.TransactionType, request.Quantity,
            quantityBefore, item.QuantityOnHand, request.UnitCost,
            request.ReferenceType, request.ReferenceId,
            request.Notes, request.TransactedById, request.TransactedByName);

        await _itemRepo.UpdateAsync(item, ct);
        await _transactionRepo.AddAsync(transaction, ct);
        return Unit.Value;
    }
}
