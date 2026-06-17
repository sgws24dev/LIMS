using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.ValueObjects;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Inventory.Domain.Entities;

public class InventoryItem : BaseEntity
{
    public Guid TenantId { get; private set; }
    public string SKU { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public ItemCategory Category { get; private set; }
    public UnitOfMeasure UnitOfMeasure { get; private set; }
    public decimal QuantityOnHand { get; private set; }
    public decimal QuantityReserved { get; private set; }
    public decimal ReorderPoint { get; private set; }
    public decimal ReorderQuantity { get; private set; }
    public decimal UnitCost { get; private set; }
    public string? Barcode { get; private set; }
    public string? StorageLocation { get; private set; }
    public DateOnly? ExpiryDate { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsHazardous { get; private set; }
    public Guid? PreferredVendorId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public Vendor? PreferredVendor { get; private set; }
    private readonly List<StockTransaction> _stockTransactions = new();
    public IReadOnlyCollection<StockTransaction> StockTransactions => _stockTransactions.AsReadOnly();

    public decimal QuantityAvailable => QuantityOnHand - QuantityReserved;
    public bool IsLowStock => ReorderPoint > 0 && QuantityOnHand <= ReorderPoint;
    public bool IsOutOfStock => QuantityOnHand <= 0;
    public bool IsExpiringSoon =>
        ExpiryDate.HasValue &&
        ExpiryDate.Value <= DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30));
    public bool IsExpired =>
        ExpiryDate.HasValue &&
        ExpiryDate.Value < DateOnly.FromDateTime(DateTime.UtcNow);

    public StockLevel GetStockLevel() => new(
        QuantityOnHand,
        QuantityReserved,
        QuantityAvailable,
        IsLowStock,
        IsOutOfStock,
        IsExpiringSoon,
        IsExpired
    );

    private InventoryItem() { SKU = null!; Name = null!; }

    public InventoryItem(
        string sku,
        string name,
        string? description,
        ItemCategory category,
        UnitOfMeasure unitOfMeasure,
        decimal reorderPoint,
        decimal reorderQuantity,
        decimal unitCost,
        string? barcode,
        string? storageLocation,
        DateOnly? expiryDate,
        bool isHazardous,
        Guid? preferredVendorId)
    {
        SKU = sku;
        Name = name;
        Description = description;
        Category = category;
        UnitOfMeasure = unitOfMeasure;
        QuantityOnHand = 0;
        QuantityReserved = 0;
        ReorderPoint = reorderPoint;
        ReorderQuantity = reorderQuantity;
        UnitCost = unitCost;
        Barcode = barcode;
        StorageLocation = storageLocation;
        ExpiryDate = expiryDate;
        IsActive = true;
        IsHazardous = isHazardous;
        PreferredVendorId = preferredVendorId;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Update(
        string name,
        string? description,
        ItemCategory category,
        UnitOfMeasure unitOfMeasure,
        decimal reorderPoint,
        decimal reorderQuantity,
        decimal unitCost,
        string? barcode,
        string? storageLocation,
        DateOnly? expiryDate,
        bool isActive,
        bool isHazardous,
        Guid? preferredVendorId)
    {
        Name = name;
        Description = description;
        Category = category;
        UnitOfMeasure = unitOfMeasure;
        ReorderPoint = reorderPoint;
        ReorderQuantity = reorderQuantity;
        UnitCost = unitCost;
        Barcode = barcode;
        StorageLocation = storageLocation;
        ExpiryDate = expiryDate;
        IsActive = isActive;
        IsHazardous = isHazardous;
        PreferredVendorId = preferredVendorId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AdjustStock(decimal delta, string reason)
    {
        if (QuantityOnHand + delta < 0)
            throw new InvalidOperationException(
                $"Cannot reduce stock below zero. " +
                $"Current: {QuantityOnHand}, Delta: {delta}");
        QuantityOnHand += delta;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ReserveStock(decimal quantity)
    {
        if (quantity > QuantityAvailable)
            throw new InvalidOperationException(
                $"Insufficient available stock. " +
                $"Available: {QuantityAvailable}, Requested: {quantity}");
        QuantityReserved += quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ReleaseReservation(decimal quantity)
    {
        QuantityReserved = Math.Max(0, QuantityReserved - quantity);
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateUnitCost(decimal unitCost)
    {
        UnitCost = unitCost;
        UpdatedAt = DateTime.UtcNow;
    }
}
