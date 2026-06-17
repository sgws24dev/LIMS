namespace ResearchLms.Billing.Domain.Enums;

public enum InvoiceStatus
{
    Draft,
    Pending,
    Approved,
    Sent,
    Paid,
    Overdue,
    Voided,
    CreditNote
}
