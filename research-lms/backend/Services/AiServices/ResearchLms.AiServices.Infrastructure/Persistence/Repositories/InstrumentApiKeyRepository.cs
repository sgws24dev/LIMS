using Microsoft.EntityFrameworkCore;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Interfaces;

namespace ResearchLms.AiServices.Infrastructure.Persistence.Repositories;

public class InstrumentApiKeyRepository : IInstrumentApiKeyRepository
{
    private readonly AiServicesDbContext _context;

    public InstrumentApiKeyRepository(AiServicesDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<InstrumentApiKey>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default)
    {
        return await _context.Set<InstrumentApiKey>()
            .Where(k => k.TenantId == tenantId)
            .ToListAsync(ct);
    }

    public async Task<InstrumentApiKey?> GetByKeyHashAsync(string keyHash, CancellationToken ct = default)
    {
        return await _context.Set<InstrumentApiKey>()
            .FirstOrDefaultAsync(k => k.ApiKeyHash == keyHash && k.IsActive, ct);
    }

    public async Task<InstrumentApiKey?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Set<InstrumentApiKey>().FindAsync(new object[] { id }, ct);
    }

    public async Task AddAsync(InstrumentApiKey key, CancellationToken ct = default)
    {
        await _context.Set<InstrumentApiKey>().AddAsync(key, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(InstrumentApiKey key, CancellationToken ct = default)
    {
        _context.Set<InstrumentApiKey>().Update(key);
        await _context.SaveChangesAsync(ct);
    }
}
