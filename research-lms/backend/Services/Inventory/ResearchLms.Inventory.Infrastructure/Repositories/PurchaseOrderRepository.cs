using Microsoft.EntityFrameworkCore;
using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;
using ResearchLms.Inventory.Infrastructure.Persistence;

namespace ResearchLms.Inventory.Infrastructure.Repositories;

public class PurchaseOrderRepository : IPurchaseOrderRepository
{
    private readonly InventoryDbContext _context;

    public PurchaseOrderRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public async Task<PurchaseOrder?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.PurchaseOrders.Include(p => p.Vendor)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<PurchaseOrder?> GetByPoNumberAsync(string poNumber, CancellationToken ct = default)
        => await _context.PurchaseOrders.FirstOrDefaultAsync(p => p.PONumber == poNumber, ct);

    public async Task<PurchaseOrder?> GetByIdWithLinesAsync(Guid id, CancellationToken ct = default)
        => await _context.PurchaseOrders
            .Include(p => p.Vendor)
            .Include(p => p.Lines).ThenInclude(l => l.InventoryItem)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<PagedResult<PurchaseOrder>> GetPagedAsync(
        PurchaseOrderStatus? status, Guid? vendorId,
        DateTime? fromDate, DateTime? toDate,
        int page, int pageSize, CancellationToken ct = default)
    {
        var query = _context.PurchaseOrders.Include(p => p.Vendor).AsQueryable();

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);
        if (vendorId.HasValue)
            query = query.Where(p => p.VendorId == vendorId.Value);
        if (fromDate.HasValue)
            query = query.Where(p => p.OrderedAt >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(p => p.OrderedAt <= toDate.Value);

        var total = await query.CountAsync(ct);
        var items = await query.OrderByDescending(p => p.OrderedAt)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedResult<PurchaseOrder>(items, total, page, pageSize);
    }

    public async Task<int> GetNextSequenceAsync(int year, CancellationToken ct = default)
    {
        var prefix = $"PO-{year}-";
        var existing = await _context.PurchaseOrders
            .Where(p => p.PONumber.StartsWith(prefix))
            .ToListAsync(ct);
        if (existing.Count == 0) return 1;
        var maxSeq = existing
            .Select(p => int.TryParse(p.PONumber[prefix.Length..], out var n) ? n : 0)
            .Max();
        return maxSeq + 1;
    }

    public async Task AddAsync(PurchaseOrder purchaseOrder, CancellationToken ct = default)
    {
        await _context.PurchaseOrders.AddAsync(purchaseOrder, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(PurchaseOrder purchaseOrder, CancellationToken ct = default)
    {
        _context.PurchaseOrders.Update(purchaseOrder);
        await _context.SaveChangesAsync(ct);
    }
}
