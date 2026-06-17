using FluentValidation;
using ResearchLms.Inventory.Application.Commands.StockMovements;

namespace ResearchLms.Inventory.Application.Validators;

public class WriteOffStockValidator : AbstractValidator<WriteOffStockCommand>
{
    public WriteOffStockValidator()
    {
        RuleFor(v => v.ItemId).NotEmpty();
        RuleFor(v => v.Quantity).GreaterThan(0);
        RuleFor(v => v.Reason).NotEmpty().MaximumLength(500);
    }
}
