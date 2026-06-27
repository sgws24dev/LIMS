using FluentValidation;
using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Application.Validators;

public class CreateTaxCodeValidator : AbstractValidator<TaxCode>
{
    public CreateTaxCodeValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Country).NotEmpty().Length(2, 3);
        RuleFor(x => x.Rate).InclusiveBetween(0, 100);
        RuleFor(x => x.EffectiveFrom).NotEmpty();
    }
}
