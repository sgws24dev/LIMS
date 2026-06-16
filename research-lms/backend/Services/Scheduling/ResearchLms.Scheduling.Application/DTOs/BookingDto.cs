using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.DTOs;

public record BookingDto(
    Guid Id,
    Guid ResourceId,
    string ResourceName,
    string ResourceIdentifier,
    ResourceType ResourceType,
    Guid UserId,
    string UserName,
    string Title,
    DateTime StartTime,
    DateTime EndTime,
    BookingStatus Status,
    string? Purpose,
    string? Notes,
    decimal? Cost,
    DateTime CreatedAt
);

public record BookingDetailDto(
    Guid Id,
    Guid ResourceId,
    string ResourceName,
    string ResourceIdentifier,
    ResourceType ResourceType,
    Guid UserId,
    string UserName,
    string Title,
    DateTime StartTime,
    DateTime EndTime,
    BookingStatus Status,
    string? Purpose,
    string? Notes,
    decimal? Cost,
    DateTime CreatedAt,
    DateTime? CancelledAt,
    string? CancellationReason,
    DateTime? CheckedInAt,
    Guid? RecurringRuleId,
    string? ResourceLocation,
    string? FacilityName,
    IEnumerable<BookingStatusChangeDto> StatusHistory
);

public record BookingStatusChangeDto(
    BookingStatus From,
    BookingStatus To,
    DateTime ChangedAt,
    string? Reason
);

public record BookingResourceDto(
    Guid ResourceId,
    string Name,
    string Identifier,
    ResourceType ResourceType,
    string? Location,
    string? FacilityName,
    decimal HourlyRate,
    bool IsActive
);
