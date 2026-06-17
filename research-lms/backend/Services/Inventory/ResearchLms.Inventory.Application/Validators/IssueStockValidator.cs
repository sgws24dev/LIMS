using FluentValidation;
using ResearchLms.Inventory.Application.Commands.StockMovements;

namespace ResearchLms.Inventory.Application.Validators;

public class IssueStockValidator : AbstractValidator<IssueStockCommand>
{
    public IssueStockValidator()
    {
        RuleFor(x => x.ItemId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.Notes).MaximumLength(500);
    }
}
