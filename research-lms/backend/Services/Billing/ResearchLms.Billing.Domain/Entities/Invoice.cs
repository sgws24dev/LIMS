using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Domain.Entities;

public class Invoice : BaseEntity
{
    public string InvoiceNumber { get; private set; }
    public InvoiceStatus Status { get; private set; }
    public BilledToEntityType BilledToEntityType { get; private set; }
    public Guid? BilledToEntityId { get; private set; }
    public string BillToName { get; private set; }
    public string BillToAddress { get; private set; }
    public string BillToEmail { get; private set; }
    public string Currency { get; private set; }
    public decimal Subtotal { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public decimal AmountPaid { get; private set; }
    public decimal BalanceDue { get; private set; }
    public DateTime InvoiceDate { get; private set; }
    public DateTime DueDate { get; private set; }
    public DateTime? PaidAt { get; private set; }
    public DateTime? VoidedAt { get; private set; }
    public string? VoidReason { get; private set; }
    public ErpSyncStatus ErpSyncStatus { get; private set; }
    public Guid? CreditNoteForInvoiceId { get; private set; }

    private readonly List<InvoiceLineItem> _lineItems = new();
    public IReadOnlyCollection<InvoiceLineItem> LineItems => _lineItems.AsReadOnly();

    public Invoice? CreditNoteForInvoice { get; private set; }

    private Invoice() { InvoiceNumber = null!; BillToName = null!; BillToAddress = null!; BillToEmail = null!; Currency = null!; }

    public Invoice(
        string invoiceNumber,
        BilledToEntityType billedToEntityType,
        Guid? billedToEntityId,
        string billToName,
        string billToAddress,
        string billToEmail,
        string currency,
        DateTime invoiceDate,
        DateTime dueDate,
        string createdBy)
    {
        InvoiceNumber = invoiceNumber;
        Status = InvoiceStatus.Draft;
        BilledToEntityType = billedToEntityType;
        BilledToEntityId = billedToEntityId;
        BillToName = billToName;
        BillToAddress = billToAddress;
        BillToEmail = billToEmail;
        Currency = currency;
        Subtotal = 0;
        DiscountAmount = 0;
        TaxAmount = 0;
        TotalAmount = 0;
        AmountPaid = 0;
        BalanceDue = 0;
        InvoiceDate = invoiceDate;
        DueDate = dueDate;
        ErpSyncStatus = Enums.ErpSyncStatus.Pending;
        MarkCreated(createdBy);
    }

    public void AddLineItem(InvoiceLineItem lineItem)
    {
        _lineItems.Add(lineItem);
        RecalculateTotals();
    }

    public void AddLineItems(IEnumerable<InvoiceLineItem> lineItems)
    {
        foreach (var item in lineItems)
            _lineItems.Add(item);
        RecalculateTotals();
    }

    public void UpdateLineItems(List<InvoiceLineItem> updatedItems)
    {
        _lineItems.Clear();
        foreach (var item in updatedItems)
            _lineItems.Add(item);
        RecalculateTotals();
    }

    public void RecalculateTotals()
    {
        Subtotal = _lineItems.Sum(li => li.LineTotal);
        DiscountAmount = _lineItems.Sum(li => li.LineTotal * li.DiscountPercent / 100);
        TaxAmount = _lineItems.Sum(li => (li.LineTotal - (li.LineTotal * li.DiscountPercent / 100)) * li.TaxRate / 100);
        TotalAmount = Subtotal - DiscountAmount + TaxAmount;
        BalanceDue = TotalAmount - AmountPaid;
    }

    public void ClearLineItems()
    {
        _lineItems.Clear();
    }

    public void RecalculateForCurrency(decimal convertedTotal, string currency)
    {
        Currency = currency;
        var ratio = Subtotal > 0 ? convertedTotal / TotalAmount : 1;
        Subtotal = Math.Round(Subtotal * ratio, 2);
        DiscountAmount = Math.Round(DiscountAmount * ratio, 2);
        TaxAmount = Math.Round(TaxAmount * ratio, 2);
        TotalAmount = Math.Round(convertedTotal, 2);
        BalanceDue = TotalAmount - AmountPaid;
    }

    public void Approve(string modifiedBy)
    {
        if (Status != InvoiceStatus.Draft && Status != InvoiceStatus.Pending)
            throw new InvalidOperationException("Only draft or pending invoices can be approved.");
        Status = InvoiceStatus.Approved;
        RecalculateTotals();
        MarkUpdated(modifiedBy);
    }

    public void Send(string modifiedBy)
    {
        if (Status != InvoiceStatus.Approved)
            throw new InvalidOperationException("Only approved invoices can be sent.");
        Status = InvoiceStatus.Sent;
        MarkUpdated(modifiedBy);
    }

    public void RecordPayment(decimal amount, string modifiedBy)
    {
        if (Status is InvoiceStatus.Paid or InvoiceStatus.Voided)
            throw new InvalidOperationException("Cannot record payment on paid or voided invoices.");
        AmountPaid += amount;
        BalanceDue = TotalAmount - AmountPaid;
        if (BalanceDue <= 0)
        {
            Status = InvoiceStatus.Paid;
            PaidAt = DateTime.UtcNow;
        }
        MarkUpdated(modifiedBy);
    }

    public void Void(string reason, string modifiedBy)
    {
        if (Status == InvoiceStatus.Paid)
        {
            var creditNote = CreateCreditNote(modifiedBy);
            Status = InvoiceStatus.Voided;
            VoidedAt = DateTime.UtcNow;
            VoidReason = reason;
            MarkUpdated(modifiedBy);
        }
        else
        {
            Status = InvoiceStatus.Voided;
            VoidedAt = DateTime.UtcNow;
            VoidReason = reason;
            MarkUpdated(modifiedBy);
        }
    }

    private Invoice CreateCreditNote(string createdBy)
    {
        return new Invoice(
            $"CN-{InvoiceNumber}",
            BilledToEntityType,
            BilledToEntityId,
            BillToName,
            BillToAddress,
            BillToEmail,
            Currency,
            DateTime.UtcNow,
            DateTime.UtcNow,
            createdBy)
        {
            Status = InvoiceStatus.CreditNote,
            CreditNoteForInvoiceId = Id
        };
    }

    public void MarkOverdue(string modifiedBy)
    {
        if (Status == InvoiceStatus.Sent && DueDate < DateTime.UtcNow)
        {
            Status = InvoiceStatus.Overdue;
            MarkUpdated(modifiedBy);
        }
    }

    public void SetErpSyncStatus(ErpSyncStatus status, string modifiedBy)
    {
        ErpSyncStatus = status;
        MarkUpdated(modifiedBy);
    }
}
