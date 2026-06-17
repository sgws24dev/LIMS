using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Domain.Entities;

public class ErpSyncLog : BaseEntity
{
    public Guid InvoiceId { get; private set; }
    public string Direction { get; private set; }
    public ErpSyncStatus Status { get; private set; }
    public string? RequestPayload { get; private set; }
    public string? ResponsePayload { get; private set; }
    public string? ErrorMessage { get; private set; }
    public int AttemptCount { get; private set; }
    public DateTime? LastAttemptedAt { get; private set; }

    public Invoice Invoice { get; private set; } = null!;

    private ErpSyncLog() { Direction = null!; }

    public ErpSyncLog(Guid invoiceId, string direction, string? requestPayload, string createdBy)
    {
        InvoiceId = invoiceId;
        Direction = direction;
        Status = Enums.ErpSyncStatus.Pending;
        RequestPayload = requestPayload;
        AttemptCount = 0;
        MarkCreated(createdBy);
    }

    public void MarkSent(string createdBy)
    {
        Status = Enums.ErpSyncStatus.Sent;
        AttemptCount++;
        LastAttemptedAt = DateTime.UtcNow;
        MarkUpdated(createdBy);
    }

    public void MarkAcknowledged(string? responsePayload, string modifiedBy)
    {
        Status = Enums.ErpSyncStatus.Acknowledged;
        ResponsePayload = responsePayload;
        MarkUpdated(modifiedBy);
    }

    public void MarkFailed(string errorMessage, string modifiedBy)
    {
        Status = Enums.ErpSyncStatus.Failed;
        ErrorMessage = errorMessage;
        AttemptCount++;
        LastAttemptedAt = DateTime.UtcNow;
        MarkUpdated(modifiedBy);
    }
}
