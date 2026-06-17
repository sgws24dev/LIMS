using MediatR;
using ResearchLms.Inventory.Application.DTOs;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Queries.InventoryItems;

public class GetInventoryItemByIdQueryHandler : IRequestHandler<GetInventoryItemByIdQuery, InventoryItemDetailDto?>
{
    private readonly IInventoryItemRepository _itemRepo;
    private readonly IStockTransactionRepository _transactionRepo;

    public GetInventoryItemByIdQueryHandler(
        IInventoryItemRepository itemRepo,
        IStockTransactionRepository transactionRepo)
    {
        _itemRepo = itemRepo;
        _transactionRepo = transactionRepo;
    }

    public async Task<InventoryItemDetailDto?> Handle(GetInventoryItemByIdQuery request, CancellationToken ct)
    {
        var item = await _itemRepo.GetByIdAsync(request.ItemId, ct);
        if (item is null) return null;

        var transactions = await _transactionRepo.GetByItemAsync(request.ItemId);

        return new InventoryItemDetailDto(
            item.Id, item.SKU, item.Name, item.Description,
            item.Category.ToString(), item.UnitOfMeasure.ToString(),
            item.QuantityOnHand, item.QuantityReserved, item.QuantityAvailable,
            item.ReorderPoint, item.ReorderQuantity, item.UnitCost,
            item.QuantityOnHand * item.UnitCost,
            item.Barcode, item.StorageLocation, item.ExpiryDate,
            item.IsHazardous, item.IsLowStock, item.IsOutOfStock,
            item.IsExpiringSoon, item.IsExpired, item.IsActive,
            item.PreferredVendorId, item.PreferredVendor?.Name,
            item.UpdatedAt,
            transactions.Select(t => new StockTransactionDto(
                t.Id, t.Type.ToString(), t.Quantity, t.QuantityBefore,
                t.QuantityAfter, t.UnitCost, t.TotalCost,
                t.ReferenceType, t.ReferenceId, t.Notes,
                t.TransactedByName, t.TransactedAt)));
    }
}
