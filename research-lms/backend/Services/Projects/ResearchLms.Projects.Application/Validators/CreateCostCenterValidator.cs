using FluentValidation;
using ResearchLms.Projects.Application.Commands.CostCenters;

namespace ResearchLms.Projects.Application.Validators;

public class CreateCostCenterValidator : AbstractValidator<CreateCostCenterCommand>
{
    public CreateCostCenterValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50)
            .Matches(@"^[A-Z0-9\-]+$")
            .WithMessage("Code must contain only uppercase letters, numbers, and hyphens.");
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.BudgetAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ManagerName).MaximumLength(200);
        RuleFor(x => x.FiscalYear)
            .InclusiveBetween(2000, 2100)
            .When(x => x.FiscalYear.HasValue);
    }
}
