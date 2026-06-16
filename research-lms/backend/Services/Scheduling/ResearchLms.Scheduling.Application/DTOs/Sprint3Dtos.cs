using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.DTOs;

public record RecurringRuleDto(
    Guid Id,
    Guid ResourceId,
    string ResourceName,
    ResourceType ResourceType,
    string Title,
    RecurringFrequency Frequency,
    string FrequencyLabel,
    TimeOnly TimeOfDay,
    int DurationMinutes,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    RecurringRuleStatus Status,
    int GeneratedCount,
    DateOnly? LastGeneratedDate
);

public record RecurringRuleDetailDto(
    Guid Id,
    Guid ResourceId,
    string ResourceName,
    ResourceType ResourceType,
    string Title,
    string? Purpose,
    string? Notes,
    RecurringFrequency Frequency,
    string FrequencyLabel,
    int DayOfWeekMask,
    TimeOnly TimeOfDay,
    int DurationMinutes,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    int? MaxInstances,
    RecurringRuleStatus Status,
    int GeneratedCount,
    DateOnly? LastGeneratedDate,
    IEnumerable<BookingDto> UpcomingInstances
);

public record RecurringInstancePreviewDto(
    DateTime StartTime,
    DateTime EndTime,
    bool HasConflict,
    string? ConflictReason
);

public record CostBreakdownDto(
    decimal HourlyRate,
    double DurationHours,
    string DurationLabel,
    decimal BaseAmount,
    decimal Discount,
    decimal TotalAmount,
    string? DiscountReason,
    string CurrencySymbol
);

public record PagedResult<T>(
    IEnumerable<T> Items,
    int TotalCount
);
