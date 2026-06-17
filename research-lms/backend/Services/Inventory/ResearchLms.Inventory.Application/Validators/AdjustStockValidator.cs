using FluentValidation;
using ResearchLms.Inventory.Application.Commands.InventoryItems;

namespace ResearchLms.Inventory.Application.Validators;

public class AdjustStockValidator : AbstractValidator<AdjustStockCommand>
{
    public AdjustStockValidator()
    {
        RuleFor(v => v.ItemId).NotEmpty();
        RuleFor(v => v.Delta).NotEqual(0).WithMessage("Adjustment quantity must not be zero");
        RuleFor(v => v.Reason).NotEmpty().MaximumLength(500);
    }
}
