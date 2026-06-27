using FluentValidation;
using ResearchLms.Billing.Application.Commands.Invoices;

namespace ResearchLms.Billing.Application.Validators;

public class CreateInvoiceValidator : AbstractValidator<CreateInvoiceCommand>
{
    public CreateInvoiceValidator()
    {
        RuleFor(x => x.BillToName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.BillToAddress).NotEmpty().MaximumLength(500);
        RuleFor(x => x.BillToEmail).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.InvoiceDate).NotEmpty();
        RuleFor(x => x.DueDate).GreaterThanOrEqualTo(x => x.InvoiceDate)
            .WithMessage("Due date must be on or after invoice date.");
        RuleFor(x => x.LineItems).NotEmpty().WithMessage("At least one line item is required.");
        RuleForEach(x => x.LineItems).ChildRules(item =>
        {
            item.RuleFor(i => i.Description).NotEmpty().MaximumLength(500);
            item.RuleFor(i => i.Quantity).GreaterThan(0);
            item.RuleFor(i => i.UnitPrice).GreaterThanOrEqualTo(0);
            item.RuleFor(i => i.DiscountPercent).InclusiveBetween(0, 100);
            item.RuleFor(i => i.TaxRate).InclusiveBetween(0, 100);
        });
    }
}
