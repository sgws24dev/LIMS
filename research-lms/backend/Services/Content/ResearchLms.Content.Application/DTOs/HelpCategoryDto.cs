namespace ResearchLms.Content.Application.DTOs;

public record HelpCategoryDto(
    Guid Id,
    string Name,
    string Slug,
    int SortOrder,
    Guid? ParentCategoryId
);
