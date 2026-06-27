using Microsoft.EntityFrameworkCore;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Interfaces;

namespace ResearchLms.AiServices.Infrastructure.Persistence.Repositories;

public class HelpdeskConversationRepository : IHelpdeskConversationRepository
{
    private readonly AiServicesDbContext _context;

    public HelpdeskConversationRepository(AiServicesDbContext context) => _context = context;

    public async Task<IReadOnlyList<HelpdeskConversation>> GetByUserAsync(Guid tenantId, Guid userId, CancellationToken ct)
    {
        return await _context.HelpdeskConversations
            .Where(c => c.TenantId == tenantId && c.UserId == userId)
            .Include(c => c.Messages.OrderBy(m => m.CreatedAt))
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<HelpdeskConversation?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.HelpdeskConversations
            .Include(c => c.Messages.OrderBy(m => m.CreatedAt))
            .FirstOrDefaultAsync(c => c.Id == id, ct);
    }

    public async Task AddAsync(HelpdeskConversation conversation, CancellationToken ct)
    {
        await _context.HelpdeskConversations.AddAsync(conversation, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(HelpdeskConversation conversation, CancellationToken ct)
    {
        _context.HelpdeskConversations.Update(conversation);
        await _context.SaveChangesAsync(ct);
    }
}
