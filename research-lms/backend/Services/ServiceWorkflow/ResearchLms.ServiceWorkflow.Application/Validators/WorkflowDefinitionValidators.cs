using FluentValidation;
using ResearchLms.ServiceWorkflow.Application.Commands.WorkflowDefinitions;

namespace ResearchLms.ServiceWorkflow.Application.Validators;

public class CreateWorkflowDefinitionValidator : AbstractValidator<CreateWorkflowDefinitionCommand>
{
    public CreateWorkflowDefinitionValidator()
    {
        RuleFor(v => v.Name).NotEmpty().MaximumLength(200);
        RuleFor(v => v.Description).MaximumLength(1000);
        RuleFor(v => v.States).NotEmpty().WithMessage("At least one state is required");
        RuleFor(v => v.Transitions).NotEmpty().WithMessage("At least one transition is required");
    }
}

public class UpdateWorkflowDefinitionValidator : AbstractValidator<UpdateWorkflowDefinitionCommand>
{
    public UpdateWorkflowDefinitionValidator()
    {
        RuleFor(v => v.Id).NotEmpty();
        RuleFor(v => v.Name).NotEmpty().MaximumLength(200);
    }
}

public class PublishWorkflowDefinitionValidator : AbstractValidator<PublishWorkflowDefinitionCommand>
{
    public PublishWorkflowDefinitionValidator()
    {
        RuleFor(v => v.Id).NotEmpty();
    }
}
