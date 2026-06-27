using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Infrastructure.Persistence.Repositories;

public class ReportRepository : IReportRepository
{
    private readonly BillingDbContext _dbContext;

    public ReportRepository(BillingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ReportDefinition?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _dbContext.ReportDefinitions.FindAsync(new object[] { id }, ct);
    }

    public async Task<List<ReportDefinition>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default)
    {
        return await _dbContext.ReportDefinitions
            .Where(r => r.TenantId == tenantId && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task AddAsync(ReportDefinition report, CancellationToken ct = default)
    {
        await _dbContext.ReportDefinitions.AddAsync(report, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(ReportDefinition report, CancellationToken ct = default)
    {
        _dbContext.ReportDefinitions.Update(report);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(ReportDefinition report, CancellationToken ct = default)
    {
        _dbContext.ReportDefinitions.Remove(report);
        await _dbContext.SaveChangesAsync(ct);
    }
}
