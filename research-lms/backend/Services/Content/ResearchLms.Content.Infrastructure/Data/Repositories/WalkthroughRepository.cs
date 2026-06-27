using Microsoft.EntityFrameworkCore;
using ResearchLms.Content.Domain.Entities;
using ResearchLms.Content.Domain.Interfaces;
using ResearchLms.Content.Infrastructure.Data;

namespace ResearchLms.Content.Infrastructure.Data.Repositories;

public class WalkthroughRepository : IWalkthroughRepository
{
    private readonly ContentDbContext _context;

    public WalkthroughRepository(ContentDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Walkthrough>> GetActiveByRouteAsync(Guid tenantId, string route, CancellationToken ct)
    {
        return await _context.Walkthroughs
            .Include(w => w.Steps)
            .Where(w => w.TenantId == tenantId && w.TargetRoute == route && w.IsActive)
            .OrderBy(w => w.Priority)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Walkthrough>> GetAllAsync(Guid tenantId, CancellationToken ct)
    {
        return await _context.Walkthroughs
            .Include(w => w.Steps)
            .Where(w => w.TenantId == tenantId)
            .OrderBy(w => w.Name)
            .ToListAsync(ct);
    }

    public async Task<Walkthrough?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.Walkthroughs
            .Include(w => w.Steps)
            .FirstOrDefaultAsync(w => w.Id == id, ct);
    }

    public async Task AddAsync(Walkthrough walkthrough, CancellationToken ct)
    {
        await _context.Walkthroughs.AddAsync(walkthrough, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Walkthrough walkthrough, CancellationToken ct)
    {
        _context.Walkthroughs.Update(walkthrough);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var walkthrough = await GetByIdAsync(id, ct);
        if (walkthrough != null)
        {
            _context.Walkthroughs.Remove(walkthrough);
            await _context.SaveChangesAsync(ct);
        }
    }
}
