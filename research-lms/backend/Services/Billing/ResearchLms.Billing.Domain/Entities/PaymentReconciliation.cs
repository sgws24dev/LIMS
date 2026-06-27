using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Domain.Entities;

public class PaymentReconciliation : BaseEntity
{
    public Guid InvoiceId { get; private set; }
    public string ReferenceNumber { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; }
    public ReconciliationStatus Status { get; private set; }
    public DateTime TransactionDate { get; private set; }
    public DateTime? MatchedAt { get; private set; }
    public string? Notes { get; private set; }

    public Invoice Invoice { get; private set; } = null!;

    private PaymentReconciliation() { ReferenceNumber = null!; Currency = null!; }

    public PaymentReconciliation(Guid invoiceId, string referenceNumber, decimal amount, string currency, DateTime transactionDate, string createdBy)
    {
        InvoiceId = invoiceId;
        ReferenceNumber = referenceNumber;
        Amount = amount;
        Currency = currency;
        Status = ReconciliationStatus.Unmatched;
        TransactionDate = transactionDate;
        MarkCreated(createdBy);
    }

    public void Match(string modifiedBy)
    {
        Status = ReconciliationStatus.Matched;
        MatchedAt = DateTime.UtcNow;
        MarkUpdated(modifiedBy);
    }

    public void Dispute(string notes, string modifiedBy)
    {
        Status = ReconciliationStatus.Disputed;
        Notes = notes;
        MarkUpdated(modifiedBy);
    }
}
