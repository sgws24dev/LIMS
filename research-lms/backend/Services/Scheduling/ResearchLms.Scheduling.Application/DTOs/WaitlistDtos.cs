using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.DTOs;

public record WaitlistEntryDto(
    Guid Id,
    Guid ResourceId,
    string ResourceName,
    ResourceType ResourceType,
    DateOnly RequestedDate,
    TimeOnly RequestedStartTime,
    TimeOnly RequestedEndTime,
    int Position,
    WaitlistStatus Status,
    DateTime? PromotedAt,
    DateTime? ExpiresAt,
    Guid? ProvisionalBookingId,
    DateTime CreatedAt
);

public record JoinWaitlistRequest(
    Guid ResourceId,
    ResourceType ResourceType,
    DateOnly RequestedDate,
    TimeOnly RequestedStartTime,
    TimeOnly RequestedEndTime,
    string? Notes
);
