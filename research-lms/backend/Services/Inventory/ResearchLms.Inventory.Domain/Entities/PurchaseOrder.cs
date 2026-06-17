using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Inventory.Domain.Entities;

public class PurchaseOrder : BaseEntity
{
    public string PONumber { get; private set; }
    public Guid VendorId { get; private set; }
    public PurchaseOrderStatus Status { get; private set; }
    public DateTime OrderedAt { get; private set; }
    public DateTime? ExpectedDeliveryDate { get; private set; }
    public DateTime? ReceivedAt { get; private set; }
    public string? CostCenterId { get; private set; }
    public string? ShippingAddress { get; private set; }
    public string? Notes { get; private set; }
    public Guid? RequestedById { get; private set; }
    public string? RequestedByName { get; private set; }
    public Guid? ApprovedById { get; private set; }
    public string? ApprovedByName { get; private set; }
    public DateTime? ApprovedAt { get; private set; }
    public decimal Subtotal { get; private set; }
    public decimal Tax { get; private set; }
    public decimal TotalAmount { get; private set; }

    public Vendor Vendor { get; private set; } = null!;
    private readonly List<PurchaseOrderLine> _lines = new();
    public IReadOnlyCollection<PurchaseOrderLine> Lines => _lines.AsReadOnly();
    [Obsolete("Use Lines instead")]
    public IReadOnlyCollection<PurchaseOrderLine> Items => _lines.AsReadOnly();

    private PurchaseOrder() { PONumber = null!; }

    public PurchaseOrder(
        string poNumber,
        Guid vendorId,
        DateTime? expectedDeliveryDate,
        string? notes,
        string? costCenterId = null,
        string? shippingAddress = null,
        Guid? requestedById = null,
        string? requestedByName = null)
    {
        PONumber = poNumber;
        VendorId = vendorId;
        OrderedAt = DateTime.UtcNow;
        ExpectedDeliveryDate = expectedDeliveryDate;
        Status = PurchaseOrderStatus.Draft;
        Subtotal = 0;
        Tax = 0;
        TotalAmount = 0;
        Notes = notes;
        CostCenterId = costCenterId;
        ShippingAddress = shippingAddress;
        RequestedById = requestedById;
        RequestedByName = requestedByName;
    }

    public void AddItem(PurchaseOrderLine line)
    {
        _lines.Add(line);
        RecalculateTotalAmount();
    }

    public void RemoveItem(PurchaseOrderLine line)
    {
        _lines.Remove(line);
        RecalculateTotalAmount();
    }

    public void RecalculateTotalAmount()
    {
        Subtotal = _lines.Sum(l => l.TotalPrice);
        Tax = Subtotal * 0.05m;
        TotalAmount = Subtotal + Tax;
    }

    public bool CanTransitionTo(PurchaseOrderStatus newStatus) =>
        (Status, newStatus) switch
        {
            (PurchaseOrderStatus.Draft, PurchaseOrderStatus.PendingApproval) => true,
            (PurchaseOrderStatus.Draft, PurchaseOrderStatus.Cancelled) => true,
            (PurchaseOrderStatus.PendingApproval, PurchaseOrderStatus.Approved) => true,
            (PurchaseOrderStatus.PendingApproval, PurchaseOrderStatus.Draft) => true,
            (PurchaseOrderStatus.PendingApproval, PurchaseOrderStatus.Cancelled) => true,
            (PurchaseOrderStatus.Approved, PurchaseOrderStatus.Ordered) => true,
            (PurchaseOrderStatus.Approved, PurchaseOrderStatus.Cancelled) => true,
            (PurchaseOrderStatus.Ordered, PurchaseOrderStatus.PartiallyReceived) => true,
            (PurchaseOrderStatus.Ordered, PurchaseOrderStatus.FullyReceived) => true,
            (PurchaseOrderStatus.PartiallyReceived, PurchaseOrderStatus.FullyReceived) => true,
            (PurchaseOrderStatus.PartiallyReceived, PurchaseOrderStatus.Cancelled) => true,
            _ => false
        };

    public void UpdateStatus(PurchaseOrderStatus newStatus)
    {
        if (!CanTransitionTo(newStatus))
            throw new InvalidOperationException(
                $"Cannot transition from {Status} to {newStatus}.");
        Status = newStatus;
        MarkUpdated("system");
    }
}
