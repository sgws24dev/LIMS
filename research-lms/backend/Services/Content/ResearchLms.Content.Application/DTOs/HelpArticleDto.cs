namespace ResearchLms.Content.Application.DTOs;

public record HelpArticleDto(
    Guid Id,
    string Title,
    string Slug,
    string Content,
    Guid CategoryId,
    string[] Tags,
    bool IsPublished,
    int ViewCount,
    DateTime CreatedAt
);
