using MediatR;
using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.StockMovements;

public class IssueStockCommandHandler : IRequestHandler<IssueStockCommand, Guid>
{
    private readonly IInventoryItemRepository _itemRepo;
    private readonly IStockTransactionRepository _transactionRepo;

    public IssueStockCommandHandler(
        IInventoryItemRepository itemRepo,
        IStockTransactionRepository transactionRepo)
    {
        _itemRepo = itemRepo;
        _transactionRepo = transactionRepo;
    }

    public async Task<Guid> Handle(IssueStockCommand request, CancellationToken ct)
    {
        var item = await _itemRepo.GetByIdAsync(request.ItemId, ct)
            ?? throw new KeyNotFoundException("Item not found.");

        if (item.QuantityOnHand < request.Quantity)
            throw new InvalidOperationException(
                $"Insufficient stock. Available: {item.QuantityOnHand}, Requested: {request.Quantity}");

        var quantityBefore = item.QuantityOnHand;
        item.AdjustStock(-request.Quantity, "Stock issue");

        var transaction = new StockTransaction(
            item.Id, StockTransactionType.Issue, request.Quantity,
            quantityBefore, item.QuantityOnHand, item.UnitCost,
            request.ReferenceType, request.ReferenceId,
            request.Notes ?? "Stock issue",
            request.TransactedById, request.TransactedByName);

        await _itemRepo.UpdateAsync(item, ct);
        await _transactionRepo.AddAsync(transaction, ct);
        return transaction.Id;
    }
}
