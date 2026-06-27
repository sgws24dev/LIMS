using ResearchLms.Compliance.Domain.Entities;

namespace ResearchLms.Compliance.Domain.Interfaces;

public interface IAuditLogRepository
{
    Task<AuditLogEntry?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<AuditLogEntry?> GetLatestAsync(CancellationToken ct = default);
    Task<IReadOnlyList<AuditLogEntry>> GetAllAsync(string? entityType = null, Guid? entityId = null, string? userId = null, DateTime? dateFrom = null, DateTime? dateTo = null, string? operation = null, int page = 1, int pageSize = 50, CancellationToken ct = default);
    Task<int> CountAsync(string? entityType = null, Guid? entityId = null, string? userId = null, DateTime? dateFrom = null, DateTime? dateTo = null, string? operation = null, CancellationToken ct = default);
    Task<IReadOnlyList<AuditLogEntry>> GetByEntityAsync(string entityType, Guid entityId, CancellationToken ct = default);
    Task AddAsync(AuditLogEntry entry, CancellationToken ct = default);
}
