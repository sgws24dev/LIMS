using MediatR;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.Commands;

public record CreateRecurringRuleCommand(
    Guid ResourceId,
    ResourceType ResourceType,
    Guid UserId,
    string UserName,
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
) : IRequest<Guid>;

public record UpdateRecurringRuleCommand(
    Guid RuleId,
    string Title,
    string? Purpose,
    int DayOfWeekMask,
    TimeOnly TimeOfDay,
    int DurationMinutes,
    DateOnly? EffectiveTo,
    int? MaxInstances,
    RecurringRuleStatus Status
) : IRequest<Unit>;

public record DeleteRecurringRuleCommand(Guid RuleId) : IRequest<Unit>;
