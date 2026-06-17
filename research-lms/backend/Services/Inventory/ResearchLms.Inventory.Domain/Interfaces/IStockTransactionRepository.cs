using ResearchLms.Inventory.Domain.Entities;

namespace ResearchLms.Inventory.Domain.Interfaces;

public interface IStockTransactionRepository
{
    Task<StockTransaction?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<StockTransaction>> GetByItemAsync(Guid inventoryItemId, int limit = 50, CancellationToken ct = default);
    Task<IEnumerable<StockTransaction>> GetByReferenceAsync(string referenceType, Guid referenceId, CancellationToken ct = default);
    Task AddAsync(StockTransaction transaction, CancellationToken ct = default);
    Task<StockMovementSummary> GetMovementSummaryAsync(Guid itemId, DateTime from, DateTime to, CancellationToken ct = default);
}

public record StockMovementSummary(
    Guid ItemId,
    decimal TotalReceived,
    decimal TotalIssued,
    decimal TotalAdjusted,
    decimal NetChange,
    decimal OpeningBalance,
    decimal ClosingBalance
);
