using Microsoft.EntityFrameworkCore;
using ResearchLms.Content.Domain.Entities;
using ResearchLms.Content.Domain.Interfaces;

namespace ResearchLms.Content.Infrastructure.Data.Repositories;

public class PublicationRepository : IPublicationRepository
{
    private readonly ContentDbContext _context;

    public PublicationRepository(ContentDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Publication>> SearchAsync(Guid tenantId,
        string? searchTerm, string? type, string? author, int? year, string? journal,
        CancellationToken ct)
    {
        var query = _context.Set<Publication>().Where(p => p.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(p =>
                p.Title.ToLower().Contains(term) ||
                (p.Abstract != null && p.Abstract.ToLower().Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(p => p.Type.ToString() == type);

        if (!string.IsNullOrWhiteSpace(author))
        {
            var authorLower = author.ToLower();
            query = query.Where(p => p.AuthorsJson.ToLower().Contains(authorLower));
        }

        if (year.HasValue)
            query = query.Where(p => p.PublicationDate != null && p.PublicationDate.Value.Year == year.Value);

        if (!string.IsNullOrWhiteSpace(journal))
            query = query.Where(p => p.Journal != null && p.Journal.ToLower().Contains(journal.ToLower()));

        return await query.OrderByDescending(p => p.PublicationDate ?? p.CreatedAt).ToListAsync(ct);
    }

    public async Task<Publication?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.Set<Publication>().FindAsync(new object[] { id }, ct);
    }

    public async Task<Publication?> GetByDoiAsync(string doi, CancellationToken ct)
    {
        return await _context.Set<Publication>()
            .FirstOrDefaultAsync(p => p.Doi == doi, ct);
    }

    public async Task AddAsync(Publication publication, CancellationToken ct)
    {
        await _context.Set<Publication>().AddAsync(publication, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Publication publication, CancellationToken ct)
    {
        _context.Set<Publication>().Update(publication);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var publication = await GetByIdAsync(id, ct);
        if (publication != null)
        {
            var links = await _context.Set<PublicationInstrumentLink>()
                .Where(l => l.PublicationId == id).ToListAsync(ct);
            _context.Set<PublicationInstrumentLink>().RemoveRange(links);
            _context.Set<Publication>().Remove(publication);
            await _context.SaveChangesAsync(ct);
        }
    }

    public async Task<IReadOnlyList<Guid>> GetLinkedInstrumentIdsAsync(Guid publicationId, CancellationToken ct)
    {
        return await _context.Set<PublicationInstrumentLink>()
            .Where(l => l.PublicationId == publicationId)
            .Select(l => l.InstrumentId)
            .ToListAsync(ct);
    }

    public async Task AddInstrumentLinkAsync(Guid publicationId, Guid instrumentId, CancellationToken ct)
    {
        var exists = await _context.Set<PublicationInstrumentLink>()
            .AnyAsync(l => l.PublicationId == publicationId && l.InstrumentId == instrumentId, ct);
        if (!exists)
        {
            _context.Set<PublicationInstrumentLink>().Add(
                new PublicationInstrumentLink(publicationId, instrumentId));
            await _context.SaveChangesAsync(ct);
        }
    }

    public async Task RemoveInstrumentLinkAsync(Guid publicationId, Guid instrumentId, CancellationToken ct)
    {
        var link = await _context.Set<PublicationInstrumentLink>()
            .FirstOrDefaultAsync(l => l.PublicationId == publicationId && l.InstrumentId == instrumentId, ct);
        if (link != null)
        {
            _context.Set<PublicationInstrumentLink>().Remove(link);
            await _context.SaveChangesAsync(ct);
        }
    }
}
