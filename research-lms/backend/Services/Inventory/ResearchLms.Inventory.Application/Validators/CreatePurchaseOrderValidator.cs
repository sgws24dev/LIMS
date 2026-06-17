using FluentValidation;
using ResearchLms.Inventory.Application.Commands.PurchaseOrders;

namespace ResearchLms.Inventory.Application.Validators;

public class CreatePurchaseOrderValidator : AbstractValidator<CreatePurchaseOrderCommand>
{
    public CreatePurchaseOrderValidator()
    {
        RuleFor(x => x.VendorId).NotEmpty();
        RuleFor(x => x.Notes).MaximumLength(1000);
        RuleFor(x => x.ShippingAddress).MaximumLength(500);
        RuleFor(x => x.CostCenterId).MaximumLength(100);
        RuleFor(x => x.Lines).NotEmpty().WithMessage("At least one line item is required.");
        RuleForEach(x => x.Lines).ChildRules(line =>
        {
            line.RuleFor(i => i.InventoryItemId).NotEmpty();
            line.RuleFor(i => i.QuantityOrdered).GreaterThan(0);
            line.RuleFor(i => i.UnitPrice).GreaterThanOrEqualTo(0);
            line.RuleFor(i => i.Description).MaximumLength(500);
            line.RuleFor(i => i.Notes).MaximumLength(500);
        });
    }
}
