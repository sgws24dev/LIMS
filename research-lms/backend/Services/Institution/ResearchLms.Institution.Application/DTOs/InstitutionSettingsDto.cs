namespace ResearchLms.Institution.Application.DTOs;

public record InstitutionSettingsDto(
    Guid Id,
    Guid TenantId,
    string? LogoUrl,
    string? PrimaryColor,
    string? Timezone,
    string? DateFormat,
    Dictionary<string, string> CustomSettings);

public record UpdateInstitutionSettingsDto(
    string? LogoUrl,
    string? PrimaryColor,
    string? Timezone,
    string? DateFormat,
    Dictionary<string, string>? CustomSettings);
