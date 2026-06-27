using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IMcpToolLogRepository
{
    Task AddAsync(McpToolLog log, CancellationToken ct = default);
}
