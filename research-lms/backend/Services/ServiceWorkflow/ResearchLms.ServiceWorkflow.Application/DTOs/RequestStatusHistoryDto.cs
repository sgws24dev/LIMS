namespace ResearchLms.ServiceWorkflow.Application.DTOs;

public record RequestStatusHistoryDto(
    Guid Id,
    Guid ServiceRequestId,
    string FromStatus,
    string ToStatus,
    string? Comment,
    string ChangedBy,
    DateTime ChangedAt
);
