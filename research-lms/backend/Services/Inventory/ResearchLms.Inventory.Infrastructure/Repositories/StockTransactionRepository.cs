using Microsoft.EntityFrameworkCore;
using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;
using ResearchLms.Inventory.Infrastructure.Persistence;

namespace ResearchLms.Inventory.Infrastructure.Repositories;

public class StockTransactionRepository : IStockTransactionRepository
{
    private readonly InventoryDbContext _context;

    public StockTransactionRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public async Task<StockTransaction?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.StockTransactions.FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<IEnumerable<StockTransaction>> GetByItemAsync(Guid inventoryItemId, int limit = 50, CancellationToken ct = default)
        => await _context.StockTransactions
            .Where(t => t.InventoryItemId == inventoryItemId)
            .OrderByDescending(t => t.TransactedAt)
            .Take(limit)
            .ToListAsync(ct);

    public async Task<IEnumerable<StockTransaction>> GetByReferenceAsync(string referenceType, Guid referenceId, CancellationToken ct = default)
        => await _context.StockTransactions
            .Where(t => t.ReferenceType == referenceType && t.ReferenceId == referenceId)
            .OrderByDescending(t => t.TransactedAt)
            .ToListAsync(ct);

    public async Task AddAsync(StockTransaction transaction, CancellationToken ct = default)
    {
        await _context.StockTransactions.AddAsync(transaction, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<StockMovementSummary> GetMovementSummaryAsync(Guid itemId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        var transactions = await _context.StockTransactions
            .Where(t => t.InventoryItemId == itemId && t.TransactedAt >= from && t.TransactedAt <= to)
            .OrderBy(t => t.TransactedAt)
            .ToListAsync(ct);

        var firstTxn = transactions.FirstOrDefault();
        var openingBalance = firstTxn?.QuantityBefore ?? 0;
        var closingBalance = transactions.Count > 0
            ? transactions.Last().QuantityAfter
            : openingBalance;

        return new StockMovementSummary(
            ItemId: itemId,
            TotalReceived: transactions.Where(t => t.Type == StockTransactionType.Receipt).Sum(t => t.Quantity),
            TotalIssued: transactions.Where(t => t.Type == StockTransactionType.Issue).Sum(t => t.Quantity),
            TotalAdjusted: transactions.Where(t => t.Type == StockTransactionType.Adjustment).Sum(t => t.Quantity),
            NetChange: closingBalance - openingBalance,
            OpeningBalance: openingBalance,
            ClosingBalance: closingBalance
        );
    }
}
