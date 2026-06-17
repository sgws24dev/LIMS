using FluentValidation;
using ResearchLms.Inventory.Application.Commands.Vendors;

namespace ResearchLms.Inventory.Application.Validators;

public class CreateVendorValidator : AbstractValidator<CreateVendorCommand>
{
    public CreateVendorValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50)
            .Matches(@"^[A-Z0-9\-]+$")
            .WithMessage("Code must contain only uppercase letters, numbers, and hyphens.");
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ContactPerson).MaximumLength(200);
        RuleFor(x => x.Email).EmailAddress().MaximumLength(200);
        RuleFor(x => x.Phone).MaximumLength(50);
        RuleFor(x => x.Address).MaximumLength(500);
        RuleFor(x => x.Website).MaximumLength(500);
        RuleFor(x => x.PaymentTerms).IsInEnum();
        RuleFor(x => x.TaxId).MaximumLength(100);
        RuleFor(x => x.Notes).MaximumLength(2000);
    }
}
