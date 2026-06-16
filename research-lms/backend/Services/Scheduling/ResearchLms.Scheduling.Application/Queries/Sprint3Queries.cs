using MediatR;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.Queries;

public record GetRecurringRulesQuery(
    Guid? UserId,
    Guid? ResourceId,
    RecurringRuleStatus? Status,
    int Page,
    int PageSize
) : IRequest<PagedResult<RecurringRuleDto>>;

public record GetRecurringRuleByIdQuery(Guid RuleId)
    : IRequest<RecurringRuleDetailDto?>;

public record GetRecurringPreviewQuery(
    Guid? RuleId,
    RecurringFrequency? Frequency,
    int? DayOfWeekMask,
    TimeOnly? TimeOfDay,
    int? DurationMinutes,
    DateOnly? EffectiveFrom,
    DateOnly? EffectiveTo,
    int PreviewCount
) : IRequest<IEnumerable<RecurringInstancePreviewDto>>;

public record GetBookingCostQuery(
    Guid ResourceId,
    DateTime StartTime,
    DateTime EndTime,
    bool IsRecurring = false,
    int? RecurringInstanceCount = null
) : IRequest<CostBreakdownDto>;
