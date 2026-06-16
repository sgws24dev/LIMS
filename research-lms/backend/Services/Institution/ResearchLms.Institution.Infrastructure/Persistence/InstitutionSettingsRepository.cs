using Microsoft.EntityFrameworkCore;
using ResearchLms.Infrastructure.Persistence;
using ResearchLms.Institution.Domain.Interfaces;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Institution.Infrastructure.Persistence;

public class InstitutionSettingsRepository : IInstitutionSettingsRepository
{
    private readonly ResearchLmsDbContext _context;

    public InstitutionSettingsRepository(ResearchLmsDbContext context)
    {
        _context = context;
    }

    public async Task<InstitutionSettings?> GetByTenantIdAsync(Guid tenantId, CancellationToken ct)
    {
        return await _context.InstitutionSettings
            .FirstOrDefaultAsync(s => s.TenantId == tenantId, ct);
    }

    public async Task AddAsync(InstitutionSettings settings, CancellationToken ct)
    {
        await _context.InstitutionSettings.AddAsync(settings, ct);
    }

    public Task UpdateAsync(InstitutionSettings settings, CancellationToken ct)
    {
        _context.InstitutionSettings.Update(settings);
        return Task.CompletedTask;
    }
}
