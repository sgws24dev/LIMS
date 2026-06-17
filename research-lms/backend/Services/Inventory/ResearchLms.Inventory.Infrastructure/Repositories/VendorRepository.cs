using Microsoft.EntityFrameworkCore;
using ResearchLms.Inventory.Domain.Entities;
using ResearchLms.Inventory.Domain.Enums;
using ResearchLms.Inventory.Domain.Interfaces;
using ResearchLms.Inventory.Infrastructure.Persistence;

namespace ResearchLms.Inventory.Infrastructure.Repositories;

public class VendorRepository : IVendorRepository
{
    private readonly InventoryDbContext _context;

    public VendorRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public async Task<Vendor?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Vendors.FirstOrDefaultAsync(v => v.Id == id, ct);

    public async Task<Vendor?> GetByCodeAsync(string code, CancellationToken ct = default)
        => await _context.Vendors.FirstOrDefaultAsync(v => v.Code == code, ct);

    public async Task<IEnumerable<Vendor>> GetAllAsync(bool activeOnly, CancellationToken ct = default)
    {
        var query = _context.Vendors.AsQueryable();
        if (activeOnly) query = query.Where(v => v.Status == VendorStatus.Active);
        return await query.OrderBy(v => v.Name).ToListAsync(ct);
    }

    public async Task<PagedResult<Vendor>> GetPagedAsync(
        string? nameFilter,
        VendorStatus? status,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var query = _context.Vendors.AsQueryable();

        if (!string.IsNullOrWhiteSpace(nameFilter))
            query = query.Where(v => v.Name.Contains(nameFilter) || v.Code.Contains(nameFilter));
        if (status.HasValue)
            query = query.Where(v => v.Status == status.Value);

        var total = await query.CountAsync(ct);
        var items = await query.OrderBy(v => v.Name)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedResult<Vendor>(items, total, page, pageSize);
    }

    public async Task<VendorPerformanceSummary> GetPerformanceSummaryAsync(Guid vendorId, CancellationToken ct = default)
    {
        var vendor = await _context.Vendors.FirstOrDefaultAsync(v => v.Id == vendorId, ct)
            ?? throw new KeyNotFoundException($"Vendor {vendorId} not found.");

        var orders = await _context.PurchaseOrders
            .Where(p => p.VendorId == vendorId)
            .ToListAsync(ct);

        var pendingCount = orders.Count(o => o.Status == PurchaseOrderStatus.PendingApproval
            || o.Status == PurchaseOrderStatus.Approved
            || o.Status == PurchaseOrderStatus.Ordered);
        var totalOrders = orders.Count;
        var totalValue = orders.Sum(o => o.TotalAmount);

        return new VendorPerformanceSummary(
            VendorId: vendor.Id,
            VendorName: vendor.Name,
            TotalOrders: totalOrders,
            TotalOrderValue: totalValue,
            AverageOrderValue: totalOrders > 0 ? totalValue / totalOrders : 0,
            PendingOrderCount: pendingCount
        );
    }

    public async Task AddAsync(Vendor vendor, CancellationToken ct = default)
    {
        await _context.Vendors.AddAsync(vendor, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Vendor vendor, CancellationToken ct = default)
    {
        _context.Vendors.Update(vendor);
        await _context.SaveChangesAsync(ct);
    }
}
