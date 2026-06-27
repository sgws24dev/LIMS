using Microsoft.EntityFrameworkCore;
using ResearchLms.Content.Domain.Entities;
using ResearchLms.Content.Domain.Interfaces;
using ResearchLms.Content.Infrastructure.Data;
using System.Text.Json;

namespace ResearchLms.Content.Infrastructure.Data.Repositories;

public class HelpArticleRepository : IHelpArticleRepository
{
    private readonly ContentDbContext _context;

    public HelpArticleRepository(ContentDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<HelpArticle>> SearchAsync(
        Guid tenantId, string? searchTerm, Guid? categoryId,
        List<string>? tags, bool? publishedOnly, CancellationToken ct)
    {
        var query = _context.HelpArticles.Where(a => a.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(a => a.Title.ToLower().Contains(term) || a.Content.ToLower().Contains(term));
        }

        if (categoryId.HasValue)
            query = query.Where(a => a.CategoryId == categoryId.Value);

        if (tags?.Count > 0)
            query = query.Where(a => tags.Any(t => a.TagsJson.Contains($"\"{t}\"")));

        if (publishedOnly.HasValue)
            query = query.Where(a => a.IsPublished == publishedOnly.Value);

        return await query.OrderByDescending(a => a.CreatedAt).ToListAsync(ct);
    }

    public async Task<HelpArticle?> GetBySlugAsync(Guid tenantId, string slug, CancellationToken ct)
    {
        return await _context.HelpArticles
            .FirstOrDefaultAsync(a => a.TenantId == tenantId && a.Slug == slug, ct);
    }

    public async Task<HelpArticle?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.HelpArticles.FindAsync(new object[] { id }, ct);
    }

    public async Task AddAsync(HelpArticle article, CancellationToken ct)
    {
        await _context.HelpArticles.AddAsync(article, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(HelpArticle article, CancellationToken ct)
    {
        _context.HelpArticles.Update(article);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var article = await GetByIdAsync(id, ct);
        if (article != null)
        {
            _context.HelpArticles.Remove(article);
            await _context.SaveChangesAsync(ct);
        }
    }

    public async Task IncrementViewCountAsync(Guid id, CancellationToken ct)
    {
        var article = await GetByIdAsync(id, ct);
        if (article != null)
        {
            article.IncrementViewCount();
            await _context.SaveChangesAsync(ct);
        }
    }
}
