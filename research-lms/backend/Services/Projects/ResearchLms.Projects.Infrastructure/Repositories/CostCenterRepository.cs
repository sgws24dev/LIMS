using Microsoft.EntityFrameworkCore;
using ResearchLms.Projects.Domain.Entities;
using ResearchLms.Projects.Domain.Interfaces;
using ResearchLms.Projects.Infrastructure.Persistence;

namespace ResearchLms.Projects.Infrastructure.Repositories;

public class CostCenterRepository : ICostCenterRepository
{
    private readonly ProjectsDbContext _context;

    public CostCenterRepository(ProjectsDbContext context)
    {
        _context = context;
    }

    public async Task<CostCenter?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.CostCenters.FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<CostCenter?> GetByCodeAsync(string code, CancellationToken ct = default)
        => await _context.CostCenters.FirstOrDefaultAsync(c => c.Code == code, ct);

    public async Task<IEnumerable<CostCenter>> GetAllAsync(bool activeOnly, int? fiscalYear, CancellationToken ct = default)
    {
        var query = _context.CostCenters.AsQueryable();
        if (activeOnly) query = query.Where(c => c.IsActive);
        if (fiscalYear.HasValue) query = query.Where(c => c.FiscalYear == fiscalYear.Value);
        return await query.OrderBy(c => c.Code).ToListAsync(ct);
    }

    public async Task<CostCenterSpendSummary> GetSpendSummaryAsync(Guid costCenterId, CancellationToken ct = default)
    {
        var costCenter = await _context.CostCenters.FirstOrDefaultAsync(c => c.Id == costCenterId, ct);
        if (costCenter is null)
            throw new KeyNotFoundException("Cost center not found.");

        var workOrders = await _context.WorkOrders
            .Where(w => w.CostCenterId == costCenterId && w.BilledAmount > 0)
            .Include(w => w.Project)
            .OrderByDescending(w => w.CompletedAt)
            .ToListAsync(ct);

        return new CostCenterSpendSummary(
            costCenter.Id, costCenter.Code, costCenter.Name,
            costCenter.BudgetAmount, costCenter.SpentAmount,
            costCenter.RemainingBudget, costCenter.UtilizationPercent,
            costCenter.IsOverBudget,
            workOrders.Select(w => new WorkOrderSpendItem(
                w.Id, w.Title, w.Project.Name, w.BilledAmount, w.CompletedAt)));
    }

    public async Task AddAsync(CostCenter costCenter, CancellationToken ct = default)
    {
        await _context.CostCenters.AddAsync(costCenter, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(CostCenter costCenter, CancellationToken ct = default)
    {
        _context.CostCenters.Update(costCenter);
        await _context.SaveChangesAsync(ct);
    }
}
