using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Inventory.Domain.Entities;

public class PurchaseOrderLine : BaseEntity
{
    public Guid PurchaseOrderId { get; private set; }
    public Guid InventoryItemId { get; private set; }
    public string? Description { get; private set; }
    public decimal QuantityOrdered { get; private set; }
    public decimal QuantityReceived { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal TotalPrice { get; private set; }
    public string? Notes { get; private set; }

    public PurchaseOrder PurchaseOrder { get; private set; } = null!;
    public InventoryItem InventoryItem { get; private set; } = null!;

    public decimal QuantityPending => QuantityOrdered - QuantityReceived;
    public bool IsFullyReceived => QuantityReceived >= QuantityOrdered;

    private PurchaseOrderLine() { }

    public PurchaseOrderLine(
        Guid purchaseOrderId,
        Guid inventoryItemId,
        string? description,
        decimal quantityOrdered,
        decimal unitPrice,
        string? notes)
    {
        PurchaseOrderId = purchaseOrderId;
        InventoryItemId = inventoryItemId;
        Description = description;
        QuantityOrdered = quantityOrdered;
        QuantityReceived = 0;
        UnitPrice = unitPrice;
        TotalPrice = quantityOrdered * unitPrice;
        Notes = notes;
    }

    public void UpdateQuantity(decimal quantity)
    {
        QuantityOrdered = quantity;
        TotalPrice = QuantityOrdered * UnitPrice;
    }

    public void UpdateQuantityReceived(decimal received)
    {
        if (received > QuantityOrdered)
            throw new InvalidOperationException("Received quantity cannot exceed ordered quantity.");
        QuantityReceived = received;
    }

    public void UpdateUnitPrice(decimal unitPrice)
    {
        UnitPrice = unitPrice;
        TotalPrice = QuantityOrdered * UnitPrice;
    }
}
