using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.DTOs;

public record CalendarSyncLogDto(
    Guid Id,
    SyncProvider Provider,
    string Direction,
    string Status,
    int EventsCreated,
    int EventsUpdated,
    int EventsDeleted,
    string? ErrorMessage,
    DateTime SyncedAt
);

public record TrainerAvailabilityDto(
    Guid Id,
    Guid UserId,
    string UserName,
    DayOfWeek DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    bool IsAvailable,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    AvailabilitySource Source,
    string? Notes
);

public record MyBookingStatsDto(
    int UpcomingCount,
    decimal MonthlySpend,
    double MonthlyHours
);
