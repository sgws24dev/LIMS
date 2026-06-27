using Microsoft.EntityFrameworkCore;
using ResearchLms.Content.Domain.Entities;
using ResearchLms.Content.Domain.Interfaces;

namespace ResearchLms.Content.Infrastructure.Data.Repositories;

public class HomepageRepository : IHomepageRepository
{
    private readonly ContentDbContext _context;

    public HomepageRepository(ContentDbContext context)
    {
        _context = context;
    }

    public async Task<HomepageDefinition?> GetActiveAsync(Guid tenantId, CancellationToken ct)
    {
        return await _context.Set<HomepageDefinition>()
            .FirstOrDefaultAsync(h => h.TenantId == tenantId && h.IsActive, ct);
    }

    public async Task<HomepageDefinition?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.Set<HomepageDefinition>().FindAsync(new object[] { id }, ct);
    }

    public async Task UpsertAsync(HomepageDefinition homepage, CancellationToken ct)
    {
        var existing = await _context.Set<HomepageDefinition>()
            .FindAsync(new object[] { homepage.Id }, ct);

        if (existing != null)
        {
            _context.Entry(existing).CurrentValues.SetValues(homepage);
        }
        else
        {
            await _context.Set<HomepageDefinition>().AddAsync(homepage, ct);
        }

        await _context.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<HomepageDefinition>> GetAllAsync(Guid tenantId, CancellationToken ct)
    {
        return await _context.Set<HomepageDefinition>()
            .Where(h => h.TenantId == tenantId)
            .OrderByDescending(h => h.IsActive)
            .ThenBy(h => h.Name)
            .ToListAsync(ct);
    }
}
