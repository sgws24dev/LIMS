using FluentValidation;
using ResearchLms.ServiceWorkflow.Application.Commands.Approvals;

namespace ResearchLms.ServiceWorkflow.Application.Validators;

public class CreateApprovalCommandValidator : AbstractValidator<CreateApprovalCommand>
{
    public CreateApprovalCommandValidator()
    {
        RuleFor(x => x.ServiceRequestId).NotEmpty();
        RuleFor(x => x.StepOrder).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ApproverUserId).NotEmpty();
    }
}

public class DecideApprovalCommandValidator : AbstractValidator<DecideApprovalCommand>
{
    public DecideApprovalCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.DecidedBy).NotEmpty();
    }
}
