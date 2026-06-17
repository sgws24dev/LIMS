using FluentValidation;
using ResearchLms.Projects.Application.Commands.Issues;

namespace ResearchLms.Projects.Application.Validators;

public class CreateIssueValidator : AbstractValidator<CreateIssueCommand>
{
    public CreateIssueValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Description).MaximumLength(5000);
        RuleFor(x => x.ReportedById).NotEmpty();
        RuleFor(x => x.ReportedByName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.AssignedToName).MaximumLength(200);
        RuleFor(x => x.Tags).MaximumLength(500);
    }
}
