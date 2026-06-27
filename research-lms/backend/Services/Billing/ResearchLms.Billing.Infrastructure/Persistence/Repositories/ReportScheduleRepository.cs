using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;

namespace ResearchLms.Billing.Infrastructure.Persistence.Repositories;

public class ReportScheduleRepository : IReportScheduleRepository
{
    private readonly BillingDbContext _context;

    public ReportScheduleRepository(BillingDbContext context)
    {
        _context = context;
    }

    public async Task<List<ReportSchedule>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.ReportSchedules
            .Include(s => s.ReportDefinition)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<ReportSchedule?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.ReportSchedules
            .Include(s => s.ReportDefinition)
            .FirstOrDefaultAsync(s => s.Id == id, ct);
    }

    public async Task<List<ReportSchedule>> GetByReportDefinitionIdAsync(Guid reportDefinitionId, CancellationToken ct = default)
    {
        return await _context.ReportSchedules
            .Where(s => s.ReportDefinitionId == reportDefinitionId)
            .ToListAsync(ct);
    }

    public async Task AddAsync(ReportSchedule schedule, CancellationToken ct = default)
    {
        await _context.ReportSchedules.AddAsync(schedule, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(ReportSchedule schedule, CancellationToken ct = default)
    {
        _context.ReportSchedules.Update(schedule);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(ReportSchedule schedule, CancellationToken ct = default)
    {
        _context.ReportSchedules.Remove(schedule);
        await _context.SaveChangesAsync(ct);
    }
}
