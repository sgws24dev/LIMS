using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Interfaces;

namespace ResearchLms.AiServices.Infrastructure.Persistence.Repositories;

public class McpToolLogRepository : IMcpToolLogRepository
{
    private readonly AiServicesDbContext _context;

    public McpToolLogRepository(AiServicesDbContext context) => _context = context;

    public async Task AddAsync(McpToolLog log, CancellationToken ct)
    {
        await _context.McpToolLogs.AddAsync(log, ct);
        await _context.SaveChangesAsync(ct);
    }
}
