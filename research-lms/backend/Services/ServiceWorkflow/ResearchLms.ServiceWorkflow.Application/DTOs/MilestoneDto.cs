namespace ResearchLms.ServiceWorkflow.Application.DTOs;

public record MilestoneDto(
    Guid Id,
    Guid ServiceRequestId,
    string Title,
    string? Description,
    int Order,
    string Status,
    DateTime? DueDate,
    DateTime? CompletedAt,
    string? CompletedBy,
    string? AssignedTo
);

public record CreateMilestoneRequest(
    Guid ServiceRequestId,
    string Title,
    string? Description,
    int Order,
    DateTime? DueDate,
    string? AssignedTo
);
