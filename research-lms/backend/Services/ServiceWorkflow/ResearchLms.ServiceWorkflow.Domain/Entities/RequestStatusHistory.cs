using ResearchLms.ServiceWorkflow.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.ServiceWorkflow.Domain.Entities;

public class RequestStatusHistory : BaseEntity
{
    public Guid ServiceRequestId { get; private set; }
    public ServiceRequestStatus FromStatus { get; private set; }
    public ServiceRequestStatus ToStatus { get; private set; }
    public string? Comment { get; private set; }
    public string ChangedBy { get; private set; }

    public ServiceRequest ServiceRequest { get; private set; } = null!;

    private RequestStatusHistory() { ChangedBy = null!; }

    public RequestStatusHistory(
        Guid serviceRequestId,
        ServiceRequestStatus fromStatus,
        ServiceRequestStatus toStatus,
        string changedBy,
        string? comment = null)
    {
        ServiceRequestId = serviceRequestId;
        FromStatus = fromStatus;
        ToStatus = toStatus;
        ChangedBy = changedBy;
        Comment = comment;
        MarkCreated(changedBy);
    }
}
