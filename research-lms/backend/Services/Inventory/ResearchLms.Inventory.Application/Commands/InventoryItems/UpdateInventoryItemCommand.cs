using MediatR;
using ResearchLms.Inventory.Domain.Enums;

namespace ResearchLms.Inventory.Application.Commands.InventoryItems;

public record UpdateInventoryItemCommand(
    Guid ItemId,
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
    bool IsActive,
    bool IsHazardous,
    Guid? PreferredVendorId
) : IRequest<Unit>;
