using Microsoft.EntityFrameworkCore;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Infrastructure.Persistence;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Infrastructure.Persistence;

public class CustodyRepository : ICustodyRepository
{
    private readonly ResearchLmsDbContext _context;
    private readonly ITenantContext _tenantContext;

    public CustodyRepository(ResearchLmsDbContext context, ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public async Task<CustodyEvent?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.CustodyEvents
            .Include(c => c.Asset)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<(IReadOnlyList<CustodyEvent> Items, int TotalCount)> GetChainAsync(
        Guid assetId, int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var query = _context.CustodyEvents
            .Where(c => c.AssetId == assetId);

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(c => c.TransferredAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Include(c => c.Asset)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task<CustodyEvent?> GetCurrentCustodianAsync(Guid assetId, CancellationToken ct = default)
        => await _context.CustodyEvents
            .Where(c => c.AssetId == assetId)
            .OrderByDescending(c => c.TransferredAt)
            .FirstOrDefaultAsync(ct);

    public async Task AddAsync(CustodyEvent custodyEvent, CancellationToken ct = default)
    {
        await _context.CustodyEvents.AddAsync(custodyEvent, ct);
        await _context.SaveChangesAsync(ct);
    }
}
