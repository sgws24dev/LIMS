using ResearchLms.Billing.Domain.Entities;

namespace ResearchLms.Billing.Domain.Interfaces;

public interface ICreditRepository
{
    Task<Credit?> GetByInstitutionIdAsync(Guid institutionId, CancellationToken ct = default);
    Task AddAsync(Credit credit, CancellationToken ct = default);
    Task UpdateAsync(Credit credit, CancellationToken ct = default);
}
