using FluentValidation;
using ResearchLms.Inventory.Application.Commands.Vendors;

namespace ResearchLms.Inventory.Application.Validators;

public class UpdateVendorValidator : AbstractValidator<UpdateVendorCommand>
{
    public UpdateVendorValidator()
    {
        RuleFor(v => v.VendorId).NotEmpty();
        RuleFor(v => v.Name).NotEmpty().MaximumLength(200);
        RuleFor(v => v.LeadTimeDays).GreaterThanOrEqualTo(0);
    }
}
