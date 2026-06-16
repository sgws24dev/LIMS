using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.DTOs;

public record CreateRecurringRuleRequest(
    Guid ResourceId,
    ResourceType ResourceType,
    string Title,
    string? Purpose,
    string? Notes,
    RecurringFrequency Frequency,
    int DayOfWeekMask,
    TimeOnly TimeOfDay,
    int DurationMinutes,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    int? MaxInstances
);

public record UpdateRecurringRuleRequest(
    string Title,
    string? Purpose,
    int DayOfWeekMask,
    TimeOnly TimeOfDay,
    int DurationMinutes,
    DateOnly? EffectiveTo,
    int? MaxInstances,
    RecurringRuleStatus Status
);

public record PreviewRecurringRequest(
    RecurringFrequency Frequency,
    int DayOfWeekMask,
    TimeOnly TimeOfDay,
    int DurationMinutes,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    int? PreviewCount
);

public record CostEstimateRequest(
    Guid ResourceId,
    DateTime StartTime,
    DateTime EndTime,
    bool IsRecurring = false,
    int? RecurringInstanceCount = null
);

public record CheckInRequest(Guid BookingId);
