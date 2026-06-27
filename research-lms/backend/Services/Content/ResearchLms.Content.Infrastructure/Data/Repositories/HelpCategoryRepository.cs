using Microsoft.EntityFrameworkCore;
using ResearchLms.Content.Domain.Entities;
using ResearchLms.Content.Domain.Interfaces;
using ResearchLms.Content.Infrastructure.Data;

namespace ResearchLms.Content.Infrastructure.Data.Repositories;

public class HelpCategoryRepository : IHelpCategoryRepository
{
    private readonly ContentDbContext _context;

    public HelpCategoryRepository(ContentDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<HelpCategory>> GetAllAsync(Guid tenantId, CancellationToken ct)
    {
        return await _context.HelpCategories
            .Where(c => c.TenantId == tenantId)
            .OrderBy(c => c.SortOrder)
            .ToListAsync(ct);
    }

    public async Task<HelpCategory?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.HelpCategories.FindAsync(new object[] { id }, ct);
    }

    public async Task<HelpCategory?> GetBySlugAsync(Guid tenantId, string slug, CancellationToken ct)
    {
        return await _context.HelpCategories
            .FirstOrDefaultAsync(c => c.TenantId == tenantId && c.Slug == slug, ct);
    }

    public async Task AddAsync(HelpCategory category, CancellationToken ct)
    {
        await _context.HelpCategories.AddAsync(category, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(HelpCategory category, CancellationToken ct)
    {
        _context.HelpCategories.Update(category);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var category = await GetByIdAsync(id, ct);
        if (category != null)
        {
            _context.HelpCategories.Remove(category);
            await _context.SaveChangesAsync(ct);
        }
    }
}
