using FluentValidation;
using ResearchLms.ServiceWorkflow.Application.Commands.WorkflowInstances;

namespace ResearchLms.ServiceWorkflow.Application.Validators;

public class ExecuteTransitionValidator : AbstractValidator<ExecuteTransitionCommand>
{
    public ExecuteTransitionValidator()
    {
        RuleFor(v => v.InstanceId).NotEmpty();
        RuleFor(v => v.Trigger).NotEmpty().MaximumLength(100);
    }
}
