using MediatR;
using ResearchLms.Inventory.Application.DTOs;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Queries.InventoryItems;

public class GetInventoryItemsQueryHandler : IRequestHandler<GetInventoryItemsQuery, PagedResult<InventoryItemDto>>
{
    private readonly IInventoryItemRepository _repository;

    public GetInventoryItemsQueryHandler(IInventoryItemRepository repository) => _repository = repository;

    public async Task<PagedResult<InventoryItemDto>> Handle(GetInventoryItemsQuery request, CancellationToken ct)
    {
        var result = await _repository.GetPagedAsync(
            request.Search, request.Category?.ToString(), request.IsLowStock,
            request.IsExpiringSoon, request.IncludeInactive,
            request.Page, request.PageSize, ct);

        return new PagedResult<InventoryItemDto>(
            result.Items.Select(i => new InventoryItemDto(
                i.Id, i.SKU, i.Name, i.Description,
                i.Category.ToString(), i.UnitOfMeasure.ToString(),
                i.QuantityOnHand, i.QuantityReserved, i.QuantityAvailable,
                i.ReorderPoint, i.UnitCost, i.QuantityOnHand * i.UnitCost,
                i.Barcode, i.StorageLocation, i.ExpiryDate,
                i.IsHazardous, i.IsLowStock, i.IsOutOfStock,
                i.IsExpiringSoon, i.IsExpired, i.IsActive, i.UpdatedAt)),
            result.TotalCount, result.Page, result.PageSize);
    }
}
