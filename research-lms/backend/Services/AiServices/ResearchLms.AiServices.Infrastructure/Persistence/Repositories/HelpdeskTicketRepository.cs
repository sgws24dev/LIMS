using Microsoft.EntityFrameworkCore;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Interfaces;

namespace ResearchLms.AiServices.Infrastructure.Persistence.Repositories;

public class HelpdeskTicketRepository : IHelpdeskTicketRepository
{
    private readonly AiServicesDbContext _context;

    public HelpdeskTicketRepository(AiServicesDbContext context) => _context = context;

    public async Task<IReadOnlyList<HelpdeskTicket>> GetByTenantAsync(Guid tenantId, CancellationToken ct)
    {
        return await _context.HelpdeskTickets
            .Where(t => t.TenantId == tenantId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<HelpdeskTicket?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.HelpdeskTickets.FindAsync(new object[] { id }, ct);
    }

    public async Task AddAsync(HelpdeskTicket ticket, CancellationToken ct)
    {
        await _context.HelpdeskTickets.AddAsync(ticket, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(HelpdeskTicket ticket, CancellationToken ct)
    {
        _context.HelpdeskTickets.Update(ticket);
        await _context.SaveChangesAsync(ct);
    }
}
