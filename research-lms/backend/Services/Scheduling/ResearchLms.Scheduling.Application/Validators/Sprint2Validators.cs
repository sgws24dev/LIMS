using FluentValidation;
using ResearchLms.Scheduling.Application.Commands;

namespace ResearchLms.Scheduling.Application.Validators;

public class CreateConstraintCommandValidator : AbstractValidator<CreateConstraintCommand>
{
    public CreateConstraintCommandValidator()
    {
        RuleFor(x => x.ResourceId).NotEmpty();
        RuleFor(x => x.Type).IsInEnum();
        RuleFor(x => x.Value).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.ErrorMessage).MaximumLength(500);
    }
}

public class UpdateConstraintCommandValidator : AbstractValidator<UpdateConstraintCommand>
{
    public UpdateConstraintCommandValidator()
    {
        RuleFor(x => x.ConstraintId).NotEmpty();
        RuleFor(x => x.Value).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.ErrorMessage).MaximumLength(500);
    }
}

public class JoinWaitlistCommandValidator : AbstractValidator<JoinWaitlistCommand>
{
    public JoinWaitlistCommandValidator()
    {
        RuleFor(x => x.ResourceId).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.RequestedDate).GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow));
        RuleFor(x => x.RequestedEndTime)
            .GreaterThan(x => x.RequestedStartTime)
            .WithMessage("End time must be after start time.");
        RuleFor(x => x).Must(x =>
        {
            var start = x.RequestedDate.ToDateTime(x.RequestedStartTime);
            var end = x.RequestedDate.ToDateTime(x.RequestedEndTime);
            return (end - start).TotalHours <= 24;
        }).WithMessage("Booking cannot exceed 24 hours.");
        RuleFor(x => x.Notes).MaximumLength(500);
    }
}
