using FluentValidation;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.Commands;

public class ConnectCalendarValidator : AbstractValidator<ConnectCalendarCommand>
{
    public ConnectCalendarValidator()
    {
        RuleFor(x => x.Provider).IsInEnum();
        RuleFor(x => x.AuthorizationCode).NotEmpty();
        RuleFor(x => x.RedirectUri).NotEmpty();
    }
}

public class AddTrainerAvailabilityValidator : AbstractValidator<AddTrainerAvailabilityCommand>
{
    public AddTrainerAvailabilityValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.DayOfWeek).IsInEnum();
        RuleFor(x => x.EndTime).GreaterThan(x => x.StartTime)
            .WithMessage("End time must be after start time.");
        RuleFor(x => x.EffectiveTo)
            .GreaterThanOrEqualTo(x => x.EffectiveFrom ?? DateOnly.FromDateTime(DateTime.UtcNow))
            .When(x => x.EffectiveTo.HasValue);
        RuleFor(x => x.Notes).MaximumLength(500);
    }
}

public class UpdateTrainerAvailabilityValidator : AbstractValidator<UpdateTrainerAvailabilityCommand>
{
    public UpdateTrainerAvailabilityValidator()
    {
        RuleFor(x => x.AvailabilityId).NotEmpty();
        RuleFor(x => x.EndTime).GreaterThan(x => x.StartTime)
            .WithMessage("End time must be after start time.");
        RuleFor(x => x.Notes).MaximumLength(500);
    }
}
