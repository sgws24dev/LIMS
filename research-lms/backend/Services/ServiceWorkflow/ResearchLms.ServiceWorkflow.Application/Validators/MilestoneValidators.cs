using FluentValidation;
using ResearchLms.ServiceWorkflow.Application.Commands.Milestones;

namespace ResearchLms.ServiceWorkflow.Application.Validators;

public class CreateMilestoneCommandValidator : AbstractValidator<CreateMilestoneCommand>
{
    public CreateMilestoneCommandValidator()
    {
        RuleFor(x => x.ServiceRequestId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Order).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CreatedBy).NotEmpty();
    }
}

public class UpdateMilestoneStatusCommandValidator : AbstractValidator<UpdateMilestoneStatusCommand>
{
    public UpdateMilestoneStatusCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Action).NotEmpty()
            .Must(v => v is "start" or "complete" or "skip")
            .WithMessage("Action must be start, complete, or skip");
        RuleFor(x => x.ModifiedBy).NotEmpty();
    }
}
