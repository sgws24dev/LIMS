using FluentValidation;
using ResearchLms.Billing.Application.Commands.Pricing;

namespace ResearchLms.Billing.Application.Validators;

public class CreatePricingModelValidator : AbstractValidator<CreatePricingModelCommand>
{
    public CreatePricingModelValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.ModelType).NotEmpty().Must(v =>
            new[] { "FlatRate", "PerUnit", "Tiered", "TimeBased" }.Contains(v))
            .WithMessage("Model type must be FlatRate, PerUnit, Tiered, or TimeBased.");
        RuleFor(x => x.EffectiveFrom).NotEmpty();
        RuleFor(x => x.EffectiveTo).GreaterThanOrEqualTo(x => x.EffectiveFrom)
            .When(x => x.EffectiveTo.HasValue)
            .WithMessage("EffectiveTo must be after EffectiveFrom.");
    }
}
