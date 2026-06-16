using FluentValidation;
using ResearchLms.ServiceWorkflow.Application.Commands.FormDefinitions;

namespace ResearchLms.ServiceWorkflow.Application.Validators;

public class CreateFormDefinitionCommandValidator : AbstractValidator<CreateFormDefinitionCommand>
{
    public CreateFormDefinitionCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Schema).NotEmpty();
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
        RuleFor(x => x.CreatedBy).NotEmpty();
    }
}

public class UpdateFormDefinitionCommandValidator : AbstractValidator<UpdateFormDefinitionCommand>
{
    public UpdateFormDefinitionCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Schema).NotEmpty();
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ModifiedBy).NotEmpty();
    }
}

public class DeleteFormDefinitionCommandValidator : AbstractValidator<DeleteFormDefinitionCommand>
{
    public DeleteFormDefinitionCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.DeletedBy).NotEmpty();
    }
}

public class PublishFormDefinitionCommandValidator : AbstractValidator<PublishFormDefinitionCommand>
{
    public PublishFormDefinitionCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.ModifiedBy).NotEmpty();
    }
}
