using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.DTOs;

public record ConflictDto(
    Guid BookingId,
    string Title,
    Guid ResourceId,
    string ResourceName,
    Guid UserId,
    string UserName,
    DateTime StartTime,
    DateTime EndTime,
    BookingStatus Status
);
