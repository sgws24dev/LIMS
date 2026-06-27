using FluentValidation;
using ResearchLms.Billing.Application.Commands.Dashboards;

namespace ResearchLms.Billing.Application.Validators;

public class CreateDashboardValidator : AbstractValidator<CreateDashboardCommand>
{
    public CreateDashboardValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Dashboard name is required")
            .MaximumLength(200);

        RuleFor(x => x.Layout)
            .NotEmpty().WithMessage("Layout is required");
    }
}
