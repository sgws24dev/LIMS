using FluentValidation;
using ResearchLms.Inventory.Application.Commands.PurchaseOrders;

namespace ResearchLms.Inventory.Application.Validators;

public class AddPurchaseOrderLineValidator : AbstractValidator<AddPurchaseOrderLineCommand>
{
    public AddPurchaseOrderLineValidator()
    {
        RuleFor(v => v.PurchaseOrderId).NotEmpty();
        RuleFor(v => v.InventoryItemId).NotEmpty();
        RuleFor(v => v.QuantityOrdered).GreaterThan(0);
        RuleFor(v => v.UnitPrice).GreaterThanOrEqualTo(0);
    }
}
