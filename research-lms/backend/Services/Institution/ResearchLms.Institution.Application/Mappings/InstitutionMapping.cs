using ResearchLms.Institution.Application.DTOs;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Institution.Application.Mappings;

public static class InstitutionMapping
{
    public static InstitutionSettingsDto ToDto(InstitutionSettings settings)
    {
        return new InstitutionSettingsDto(
            settings.Id,
            settings.TenantId,
            settings.LogoUrl,
            settings.PrimaryColor,
            settings.Timezone,
            settings.DateFormat,
            settings.CustomSettings);
    }

    public static void ApplyDto(InstitutionSettings settings, UpdateInstitutionSettingsDto dto)
    {
        if (dto.LogoUrl is not null) settings.LogoUrl = dto.LogoUrl;
        if (dto.PrimaryColor is not null) settings.PrimaryColor = dto.PrimaryColor;
        if (dto.Timezone is not null) settings.Timezone = dto.Timezone;
        if (dto.DateFormat is not null) settings.DateFormat = dto.DateFormat;
        if (dto.CustomSettings is not null) settings.CustomSettings = dto.CustomSettings;
    }
}
