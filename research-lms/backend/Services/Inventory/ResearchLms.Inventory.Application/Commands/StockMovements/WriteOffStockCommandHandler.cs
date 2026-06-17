using MediatR;
using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.StockMovements;

public class WriteOffStockCommandHandler : IRequestHandler<WriteOffStockCommand, Guid>
{
    private readonly IInventoryItemRepository _itemRepo;
    private readonly IStockTransactionRepository _transactionRepo;

    public WriteOffStockCommandHandler(
        IInventoryItemRepository itemRepo,
        IStockTransactionRepository transactionRepo)
    {
        _itemRepo = itemRepo;
        _transactionRepo = transactionRepo;
    }

    public async Task<Guid> Handle(WriteOffStockCommand request, CancellationToken ct)
    {
        var item = await _itemRepo.GetByIdAsync(request.ItemId, ct)
            ?? throw new KeyNotFoundException("Item not found.");

        if (item.QuantityOnHand < request.Quantity)
            throw new InvalidOperationException(
                $"Cannot write off {request.Quantity} units. Only {item.QuantityOnHand} available.");

        var quantityBefore = item.QuantityOnHand;
        item.AdjustStock(-request.Quantity, $"Write-off: {request.Reason}");

        var transaction = new StockTransaction(
            item.Id, StockTransactionType.WriteOff, request.Quantity,
            quantityBefore, item.QuantityOnHand, item.UnitCost,
            "WriteOff", null,
            $"Write-off: {request.Reason}",
            request.TransactedById, request.TransactedByName);

        await _itemRepo.UpdateAsync(item, ct);
        await _transactionRepo.AddAsync(transaction, ct);
        return transaction.Id;
    }
}
