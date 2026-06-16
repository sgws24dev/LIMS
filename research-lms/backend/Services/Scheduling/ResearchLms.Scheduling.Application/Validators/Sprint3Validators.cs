using FluentValidation;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.Commands;

public class CreateRecurringRuleValidator : AbstractValidator<CreateRecurringRuleCommand>
{
    public CreateRecurringRuleValidator()
    {
        RuleFor(x => x.ResourceId).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(300);
        RuleFor(x => x.DurationMinutes).InclusiveBetween(15, 1440);
        RuleFor(x => x.EffectiveFrom).GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow));
        RuleFor(x => x.EffectiveTo)
            .GreaterThan(x => x.EffectiveFrom)
            .When(x => x.EffectiveTo.HasValue);
        RuleFor(x => x.MaxInstances)
            .InclusiveBetween(1, 500)
            .When(x => x.MaxInstances.HasValue);
        RuleFor(x => x.DayOfWeekMask)
            .InclusiveBetween(1, 127)
            .When(x => x.Frequency != RecurringFrequency.Daily
                     && x.Frequency != RecurringFrequency.Monthly);
    }
}

public class UpdateRecurringRuleValidator : AbstractValidator<UpdateRecurringRuleCommand>
{
    public UpdateRecurringRuleValidator()
    {
        RuleFor(x => x.RuleId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(300);
        RuleFor(x => x.DurationMinutes).InclusiveBetween(15, 1440);
        RuleFor(x => x.MaxInstances)
            .InclusiveBetween(1, 500)
            .When(x => x.MaxInstances.HasValue);
    }
}
