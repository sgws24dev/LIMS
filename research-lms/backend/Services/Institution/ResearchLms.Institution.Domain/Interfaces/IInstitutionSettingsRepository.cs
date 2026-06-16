namespace ResearchLms.Institution.Domain.Interfaces;

using ResearchLms.Shared.Domain.Entities;

public interface IInstitutionSettingsRepository
{
    Task<InstitutionSettings?> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default);
    Task AddAsync(InstitutionSettings settings, CancellationToken ct = default);
    Task UpdateAsync(InstitutionSettings settings, CancellationToken ct = default);
}
