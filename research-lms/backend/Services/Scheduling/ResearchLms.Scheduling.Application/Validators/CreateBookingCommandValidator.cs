using FluentValidation;
using ResearchLms.Scheduling.Application.Commands;

namespace ResearchLms.Scheduling.Application.Validators;

public class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator()
    {
        RuleFor(x => x.ResourceId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.StartTime).NotEmpty();
        RuleFor(x => x.EndTime).NotEmpty()
            .GreaterThan(x => x.StartTime).WithMessage("End time must be after start time.");
        RuleFor(x => x).Must(x => (x.EndTime - x.StartTime).TotalHours <= 24)
            .WithMessage("Booking cannot exceed 24 hours.");
    }
}
