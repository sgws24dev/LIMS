using MediatR;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.InventoryItems;

public class UpdateInventoryItemCommandHandler : IRequestHandler<UpdateInventoryItemCommand, Unit>
{
    private readonly IInventoryItemRepository _repository;

    public UpdateInventoryItemCommandHandler(IInventoryItemRepository repository) => _repository = repository;

    public async Task<Unit> Handle(UpdateInventoryItemCommand request, CancellationToken ct)
    {
        var item = await _repository.GetByIdAsync(request.ItemId, ct)
            ?? throw new KeyNotFoundException("Inventory item not found.");

        item.Update(
            request.Name, request.Description, request.Category,
            request.UnitOfMeasure, request.ReorderPoint, request.ReorderQuantity,
            request.UnitCost, request.Barcode, request.StorageLocation,
            request.ExpiryDate, request.IsActive, request.IsHazardous,
            request.PreferredVendorId);

        await _repository.UpdateAsync(item, ct);
        return Unit.Value;
    }
}
