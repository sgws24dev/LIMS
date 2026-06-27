using ResearchLms.Compliance.Domain.Entities;

namespace ResearchLms.Compliance.Domain.Interfaces;

public interface ISignatureRepository
{
    Task<Signature?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Signature>> GetByEntityAsync(string entityType, Guid entityId, CancellationToken ct = default);
    Task AddAsync(Signature signature, CancellationToken ct = default);
}
