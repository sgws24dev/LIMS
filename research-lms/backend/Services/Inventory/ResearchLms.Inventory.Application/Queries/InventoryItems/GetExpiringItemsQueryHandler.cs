using MediatR;
using ResearchLms.Inventory.Application.DTOs;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Queries.InventoryItems;

public class GetExpiringItemsQueryHandler : IRequestHandler<GetExpiringItemsQuery, IEnumerable<ExpiringItemDto>>
{
    private readonly IInventoryItemRepository _itemRepo;

    public GetExpiringItemsQueryHandler(IInventoryItemRepository itemRepo)
    {
        _itemRepo = itemRepo;
    }

    public async Task<IEnumerable<ExpiringItemDto>> Handle(GetExpiringItemsQuery request, CancellationToken ct)
    {
        var items = await _itemRepo.GetExpiringItemsAsync(request.DaysAhead, ct);
        var now = DateOnly.FromDateTime(DateTime.UtcNow);

        return items.Select(item => new ExpiringItemDto(
            item.Id, item.SKU, item.Name, item.Category.ToString(),
            item.QuantityOnHand, item.ExpiryDate!.Value,
            (item.ExpiryDate.Value.DayNumber - now.DayNumber),
            item.IsHazardous, item.StorageLocation));
    }
}
