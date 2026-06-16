using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.DTOs;

public record CalendarCallbackRequest(string Code, string RedirectUri);

public record AddTrainerAvailabilityRequest(
    DayOfWeek DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    bool IsAvailable,
    DateOnly? EffectiveFrom,
    DateOnly? EffectiveTo,
    string? Notes
);

public record UpdateTrainerAvailabilityRequest(
    TimeOnly StartTime,
    TimeOnly EndTime,
    bool IsAvailable,
    DateOnly? EffectiveTo,
    string? Notes
);
