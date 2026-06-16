using ResearchLms.Infrastructure.Persistence;
using ResearchLms.Institution.Application.DTOs;
using ResearchLms.Institution.Application.Interfaces;
using ResearchLms.Institution.Application.Mappings;
using ResearchLms.Institution.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Shared.Domain;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Institution.Infrastructure.Services;

public class InstitutionService : IInstitutionService
{
    private readonly IInstitutionSettingsRepository _settingsRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public InstitutionService(
        IInstitutionSettingsRepository settingsRepository,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _settingsRepository = settingsRepository;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<Result<InstitutionSettingsDto>> GetSettingsAsync(Guid tenantId, CancellationToken ct)
    {
        var settings = await _settingsRepository.GetByTenantIdAsync(tenantId, ct);
        if (settings is null)
        {
            settings = new InstitutionSettings(tenantId);
            await _settingsRepository.AddAsync(settings, ct);
            await _unitOfWork.SaveChangesAsync(ct);
        }

        return Result.Success(InstitutionMapping.ToDto(settings));
    }

    public async Task<Result<InstitutionSettingsDto>> UpdateSettingsAsync(Guid tenantId, UpdateInstitutionSettingsDto dto, CancellationToken ct)
    {
        var settings = await _settingsRepository.GetByTenantIdAsync(tenantId, ct);
        if (settings is null)
            return Result.Failure<InstitutionSettingsDto>("SETTINGS_NOT_FOUND", "Institution settings not found.");

        InstitutionMapping.ApplyDto(settings, dto);
        await _settingsRepository.UpdateAsync(settings, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return Result.Success(InstitutionMapping.ToDto(settings));
    }
}
