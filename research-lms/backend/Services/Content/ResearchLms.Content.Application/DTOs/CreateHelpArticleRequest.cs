namespace ResearchLms.Content.Application.DTOs;

public record CreateHelpArticleRequest(
    string Title,
    string Content,
    Guid CategoryId,
    string[] Tags,
    bool IsPublished
);
