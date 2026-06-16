using FluentValidation;
using ResearchLms.ServiceWorkflow.Application.Commands.ServiceRequests;

namespace ResearchLms.ServiceWorkflow.Application.Validators;

public class CreateServiceRequestCommandValidator : AbstractValidator<CreateServiceRequestCommand>
{
    public CreateServiceRequestCommandValidator()
    {
        RuleFor(x => x.FormDefinitionId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.FormData).NotEmpty();
        RuleFor(x => x.ApprovalRouting).NotEmpty()
            .Must(v => v is "ChainOfCommand" or "Parallel" or "AnyOf")
            .WithMessage("ApprovalRouting must be ChainOfCommand, Parallel, or AnyOf");
        RuleFor(x => x.CreatedBy).NotEmpty();
    }
}

public class SubmitServiceRequestCommandValidator : AbstractValidator<SubmitServiceRequestCommand>
{
    public SubmitServiceRequestCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.SubmittedBy).NotEmpty();
    }
}

public class AssignServiceRequestCommandValidator : AbstractValidator<AssignServiceRequestCommand>
{
    public AssignServiceRequestCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.AssignedTo).NotEmpty();
        RuleFor(x => x.AssignedBy).NotEmpty();
    }
}

public class CancelServiceRequestCommandValidator : AbstractValidator<CancelServiceRequestCommand>
{
    public CancelServiceRequestCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.CancelledBy).NotEmpty();
    }
}

public class ChangeServiceRequestStatusCommandValidator : AbstractValidator<ChangeServiceRequestStatusCommand>
{
    public ChangeServiceRequestStatusCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.NewStatus).NotEmpty();
        RuleFor(x => x.ChangedBy).NotEmpty();
    }
}
