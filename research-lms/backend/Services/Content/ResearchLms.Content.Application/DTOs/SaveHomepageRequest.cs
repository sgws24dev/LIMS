namespace ResearchLms.Content.Application.DTOs;

public record SaveHomepageRequest(
    string Name,
    bool IsActive,
    string LayoutJson
);
