using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.DTOs;

public record CreateBookingRequest(
    Guid ResourceId,
    ResourceType ResourceType,
    string Title,
    DateTime StartTime,
    DateTime EndTime,
    string? Purpose,
    string? Notes
);

public record UpdateBookingRequest(
    string Title,
    DateTime StartTime,
    DateTime EndTime,
    string? Purpose,
    string? Notes
);

public record CancelBookingRequest(string? Reason);
