namespace ResearchLms.Facilities.Application.DTOs;

public record FacilityDto(
    Guid Id,
    Guid TenantId,
    string Name,
    string Type,
    string? Location,
    bool IsActive,
    DateTime CreatedAt);

public record CreateFacilityDto(
    string Name,
    string Type,
    string? Location);

public record UpdateFacilityDto(
    string Name,
    string Type,
    string? Location,
    bool IsActive);
