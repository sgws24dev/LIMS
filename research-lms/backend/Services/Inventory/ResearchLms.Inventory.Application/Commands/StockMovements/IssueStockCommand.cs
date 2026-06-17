using MediatR;

namespace ResearchLms.Inventory.Application.Commands.StockMovements;

public record IssueStockCommand(
    Guid ItemId,
    decimal Quantity,
    string? ReferenceType,
    Guid? ReferenceId,
    string? Notes,
    Guid? TransactedById,
    string? TransactedByName
) : IRequest<Guid>;
