using MediatR;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.InventoryItems;

public class DeactivateInventoryItemCommandHandler : IRequestHandler<DeactivateInventoryItemCommand, Unit>
{
    private readonly IInventoryItemRepository _repository;

    public DeactivateInventoryItemCommandHandler(IInventoryItemRepository repository) => _repository = repository;

    public async Task<Unit> Handle(DeactivateInventoryItemCommand request, CancellationToken ct)
    {
        var item = await _repository.GetByIdAsync(request.ItemId, ct)
            ?? throw new KeyNotFoundException("Inventory item not found.");

        item.Update(
            item.Name, item.Description, item.Category, item.UnitOfMeasure,
            item.ReorderPoint, item.ReorderQuantity, item.UnitCost,
            item.Barcode, item.StorageLocation, item.ExpiryDate,
            false, item.IsHazardous, item.PreferredVendorId);

        await _repository.UpdateAsync(item, ct);
        return Unit.Value;
    }
}
