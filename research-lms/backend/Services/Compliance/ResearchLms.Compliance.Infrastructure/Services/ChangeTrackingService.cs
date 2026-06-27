using ResearchLms.Compliance.Domain.Entities;
using ResearchLms.Compliance.Domain.Interfaces;

namespace ResearchLms.Compliance.Infrastructure.Services;

public class ChangeTrackingService : IChangeTrackingService
{
    private readonly IAuditLogRepository _repository;

    public ChangeTrackingService(IAuditLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<AuditLogEntry>> GetChangeHistoryAsync(string entityType, Guid entityId, CancellationToken ct = default)
    {
        return await _repository.GetByEntityAsync(entityType, entityId, ct);
    }
}
