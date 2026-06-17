using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Inventory.Domain.Entities;

public class StockTransaction : BaseEntity
{
    public Guid InventoryItemId { get; private set; }
    public StockTransactionType Type { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal QuantityBefore { get; private set; }
    public decimal QuantityAfter { get; private set; }
    public decimal UnitCost { get; private set; }
    public decimal TotalCost { get; private set; }
    public string? ReferenceType { get; private set; }
    public Guid? ReferenceId { get; private set; }
    public string? Notes { get; private set; }
    public Guid? TransactedById { get; private set; }
    public string? TransactedByName { get; private set; }
    public DateTime TransactedAt { get; private set; }

    public InventoryItem InventoryItem { get; private set; } = null!;

    private StockTransaction() { }

    public StockTransaction(
        Guid inventoryItemId,
        StockTransactionType type,
        decimal quantity,
        decimal quantityBefore,
        decimal quantityAfter,
        decimal unitCost,
        string? referenceType,
        Guid? referenceId,
        string? notes,
        Guid? transactedById,
        string? transactedByName)
    {
        InventoryItemId = inventoryItemId;
        Type = type;
        Quantity = quantity;
        QuantityBefore = quantityBefore;
        QuantityAfter = quantityAfter;
        UnitCost = unitCost;
        TotalCost = quantity * unitCost;
        ReferenceType = referenceType;
        ReferenceId = referenceId;
        Notes = notes;
        TransactedById = transactedById;
        TransactedByName = transactedByName;
        TransactedAt = DateTime.UtcNow;
    }
}
