namespace ResearchLms.ServiceWorkflow.Application.DTOs;

public record ApprovalDto(
    Guid Id,
    Guid ServiceRequestId,
    int StepOrder,
    string ApproverUserId,
    string? ApproverName,
    string Status,
    string? Comment,
    DateTime? DecidedAt,
    string RequestTitle
);

public record ApprovalDecisionRequest(
    bool Approved,
    string? Comment
);

public record CreateApprovalRequest(
    Guid ServiceRequestId,
    int StepOrder,
    string ApproverUserId,
    string? ApproverName
);
