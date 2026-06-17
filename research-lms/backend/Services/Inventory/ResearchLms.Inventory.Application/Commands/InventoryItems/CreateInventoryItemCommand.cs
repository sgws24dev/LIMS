using MediatR;
using ResearchLms.Inventory.Domain.Enums;

namespace ResearchLms.Inventory.Application.Commands.InventoryItems;

public record CreateInventoryItemCommand(
    string SKU,
    string Name,
    string? Description,
    ItemCategory Category,
    UnitOfMeasure UnitOfMeasure,
    decimal ReorderPoint,
    decimal ReorderQuantity,
    decimal UnitCost,
    string? Barcode,
    string? StorageLocation,
    DateOnly? ExpiryDate,
    bool IsHazardous,
    Guid? PreferredVendorId
) : IRequest<Guid>;
