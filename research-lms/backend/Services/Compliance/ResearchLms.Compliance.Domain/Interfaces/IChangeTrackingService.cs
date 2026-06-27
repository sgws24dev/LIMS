using ResearchLms.Compliance.Domain.Entities;

namespace ResearchLms.Compliance.Domain.Interfaces;

public interface IChangeTrackingService
{
    Task<IReadOnlyList<AuditLogEntry>> GetChangeHistoryAsync(string entityType, Guid entityId, CancellationToken ct = default);
}
