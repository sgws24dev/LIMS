namespace ResearchLms.Content.Application.DTOs;

public record HomepageDto(
    Guid Id,
    string Name,
    bool IsActive,
    string LayoutJson
);
