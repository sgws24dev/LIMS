using ResearchLms.Institution.Application.DTOs;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Institution.Application.Interfaces;

public interface IInstitutionService
{
    Task<Result<InstitutionSettingsDto>> GetSettingsAsync(Guid tenantId, CancellationToken ct);
    Task<Result<InstitutionSettingsDto>> UpdateSettingsAsync(Guid tenantId, UpdateInstitutionSettingsDto dto, CancellationToken ct);
}
