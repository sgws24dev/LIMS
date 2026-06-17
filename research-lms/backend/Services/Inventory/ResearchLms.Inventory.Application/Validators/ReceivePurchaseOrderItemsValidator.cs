using FluentValidation;
using ResearchLms.Inventory.Application.Commands.PurchaseOrders;

namespace ResearchLms.Inventory.Application.Validators;

public class ReceivePurchaseOrderItemsValidator : AbstractValidator<ReceivePurchaseOrderItemsCommand>
{
    public ReceivePurchaseOrderItemsValidator()
    {
        RuleFor(v => v.PurchaseOrderId).NotEmpty();
        RuleFor(v => v.ReceivedLines).NotEmpty().WithMessage("At least one item must be received");
    }
}
