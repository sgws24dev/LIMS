using ResearchLms.Compliance.Domain.Entities;
using ResearchLms.Compliance.Domain.ValueObjects;

namespace ResearchLms.Compliance.Domain.Interfaces;

public interface IAuditService
{
    Task LogAsync(AuditLogEntry entry, CancellationToken ct = default);
    Task<HashChainResult> VerifyChainAsync(CancellationToken ct = default);
}
