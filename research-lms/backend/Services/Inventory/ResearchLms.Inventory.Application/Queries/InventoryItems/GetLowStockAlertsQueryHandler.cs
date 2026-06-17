using MediatR;
using ResearchLms.Inventory.Application.DTOs;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Queries.InventoryItems;

public class GetLowStockAlertsQueryHandler : IRequestHandler<GetLowStockAlertsQuery, IEnumerable<LowStockAlertDto>>
{
    private readonly IInventoryItemRepository _itemRepo;

    public GetLowStockAlertsQueryHandler(IInventoryItemRepository itemRepo)
    {
        _itemRepo = itemRepo;
    }

    public async Task<IEnumerable<LowStockAlertDto>> Handle(GetLowStockAlertsQuery request, CancellationToken ct)
    {
        var items = await _itemRepo.GetLowStockItemsAsync(ct);
        return items.Select(item => new LowStockAlertDto(
            item.Id, item.SKU, item.Name, item.Category.ToString(),
            item.QuantityOnHand, item.ReorderPoint, item.ReorderQuantity,
            item.StorageLocation, item.PreferredVendor?.Name));
    }
}
