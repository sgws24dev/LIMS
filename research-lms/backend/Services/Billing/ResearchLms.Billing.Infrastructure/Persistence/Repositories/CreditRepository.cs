using Microsoft.EntityFrameworkCore;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Interfaces;
using ResearchLms.Billing.Infrastructure.Persistence;

namespace ResearchLms.Billing.Infrastructure.Persistence.Repositories;

public class CreditRepository : ICreditRepository
{
    private readonly BillingDbContext _context;

    public CreditRepository(BillingDbContext context)
    {
        _context = context;
    }

    public async Task<Credit?> GetByInstitutionIdAsync(Guid institutionId, CancellationToken ct = default)
    {
        return await _context.Credits
            .FirstOrDefaultAsync(c => c.InstitutionId == institutionId, ct);
    }

    public async Task AddAsync(Credit credit, CancellationToken ct = default)
    {
        await _context.Credits.AddAsync(credit, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Credit credit, CancellationToken ct = default)
    {
        _context.Credits.Update(credit);
        await _context.SaveChangesAsync(ct);
    }
}
