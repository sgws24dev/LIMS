namespace ResearchLms.Content.Application.DTOs;

public record CreateHelpCategoryRequest(
    string Name,
    string Slug,
    int SortOrder,
    Guid? ParentCategoryId
);
