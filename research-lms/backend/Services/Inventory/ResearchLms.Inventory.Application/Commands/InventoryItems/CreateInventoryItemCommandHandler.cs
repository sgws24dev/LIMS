using MediatR;
using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.InventoryItems;

public class CreateInventoryItemCommandHandler : IRequestHandler<CreateInventoryItemCommand, Guid>
{
    private readonly IInventoryItemRepository _repository;

    public CreateInventoryItemCommandHandler(IInventoryItemRepository repository) => _repository = repository;

    public async Task<Guid> Handle(CreateInventoryItemCommand request, CancellationToken ct)
    {
        var existingBySku = await _repository.GetBySkuAsync(request.SKU, ct);
        if (existingBySku is not null)
            throw new DuplicateKeyException($"An item with SKU '{request.SKU}' already exists.");

        if (!string.IsNullOrWhiteSpace(request.Barcode))
        {
            var existingByBarcode = await _repository.GetByBarcodeAsync(request.Barcode, ct);
            if (existingByBarcode is not null)
                throw new DuplicateKeyException($"An item with barcode '{request.Barcode}' already exists.");
        }

        var item = new InventoryItem(
            request.SKU, request.Name, request.Description,
            request.Category, request.UnitOfMeasure,
            request.ReorderPoint, request.ReorderQuantity, request.UnitCost,
            request.Barcode, request.StorageLocation, request.ExpiryDate,
            request.IsHazardous, request.PreferredVendorId);

        await _repository.AddAsync(item, ct);
        return item.Id;
    }
}
