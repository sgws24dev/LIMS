namespace ResearchLms.ServiceWorkflow.Application.DTOs;

public record ServiceRequestDto(
    Guid Id,
    Guid FormDefinitionId,
    int FormDefinitionVersion,
    string FormTitle,
    string Title,
    string? Description,
    string Status,
    string FormData,
    string? AssignedTo,
    DateTime? SubmittedAt,
    string? SubmittedBy,
    DateTime? CompletedAt,
    string? CompletedBy,
    string ApprovalRouting,
    DateTime CreatedAt,
    string CreatedBy
);

public record CreateServiceRequestRequest(
    Guid FormDefinitionId,
    string Title,
    string? Description,
    string FormData,
    string ApprovalRouting
);

public record UpdateServiceRequestFormDataRequest(
    string FormData
);

public record SubmitServiceRequestRequest(
    string? Comment
);

public record AssignServiceRequestRequest(
    string AssignedTo
);
