using MediatR;
using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Application.Commands.PurchaseOrders;

public class CreatePurchaseOrderCommandHandler : IRequestHandler<CreatePurchaseOrderCommand, Guid>
{
    private readonly IPurchaseOrderRepository _poRepo;
    private readonly IVendorRepository _vendorRepo;
    private readonly IInventoryItemRepository _itemRepo;

    public CreatePurchaseOrderCommandHandler(
        IPurchaseOrderRepository poRepo,
        IVendorRepository vendorRepo,
        IInventoryItemRepository itemRepo)
    {
        _poRepo = poRepo;
        _vendorRepo = vendorRepo;
        _itemRepo = itemRepo;
    }

    public async Task<Guid> Handle(CreatePurchaseOrderCommand request, CancellationToken ct)
    {
        var vendor = await _vendorRepo.GetByIdAsync(request.VendorId, ct)
            ?? throw new KeyNotFoundException("Vendor not found.");

        var poNumber = await GeneratePONumberAsync(ct);

        var po = new PurchaseOrder(
            poNumber, request.VendorId,
            request.ExpectedDeliveryDate, request.Notes,
            request.CostCenterId, request.ShippingAddress,
            request.RequestedById, request.RequestedByName);

        foreach (var line in request.Lines)
        {
            var inventoryItem = await _itemRepo.GetByIdAsync(line.InventoryItemId, ct)
                ?? throw new KeyNotFoundException($"Inventory item {line.InventoryItemId} not found.");

            var poLine = new PurchaseOrderLine(
                po.Id, line.InventoryItemId, line.Description,
                line.QuantityOrdered, line.UnitPrice, line.Notes);
            po.AddItem(poLine);
        }

        await _poRepo.AddAsync(po, ct);
        return po.Id;
    }

    private async Task<string> GeneratePONumberAsync(CancellationToken ct)
    {
        var year = DateTime.UtcNow.Year;
        var sequence = await _poRepo.GetNextSequenceAsync(year, ct);
        return $"PO-{year}-{sequence:D5}";
    }
}
