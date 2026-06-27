using Microsoft.EntityFrameworkCore;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Interfaces;

namespace ResearchLms.AiServices.Infrastructure.Persistence.Repositories;

public class GuardrailConfigRepository : IGuardrailConfigRepository
{
    private readonly AiServicesDbContext _context;

    public GuardrailConfigRepository(AiServicesDbContext context)
    {
        _context = context;
    }

    public async Task<GuardrailConfig?> GetByActionTypeAsync(Guid tenantId, string actionType, CancellationToken ct = default)
    {
        return await _context.GuardrailConfigs
            .FirstOrDefaultAsync(c => c.TenantId == tenantId && c.ActionType == actionType, ct);
    }

    public async Task<IReadOnlyList<GuardrailConfig>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default)
    {
        return await _context.GuardrailConfigs
            .Where(c => c.TenantId == tenantId)
            .ToListAsync(ct);
    }

    public async Task AddAsync(GuardrailConfig config, CancellationToken ct = default)
    {
        await _context.GuardrailConfigs.AddAsync(config, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(GuardrailConfig config, CancellationToken ct = default)
    {
        _context.GuardrailConfigs.Update(config);
        await _context.SaveChangesAsync(ct);
    }
}
