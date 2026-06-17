using FluentValidation;
using ResearchLms.Inventory.Application.Commands.InventoryItems;

namespace ResearchLms.Inventory.Application.Validators;

public class UpdateInventoryItemValidator : AbstractValidator<UpdateInventoryItemCommand>
{
    public UpdateInventoryItemValidator()
    {
        RuleFor(v => v.ItemId).NotEmpty();
        RuleFor(v => v.Name).NotEmpty().MaximumLength(200);
        RuleFor(v => v.UnitCost).GreaterThanOrEqualTo(0);
    }
}
