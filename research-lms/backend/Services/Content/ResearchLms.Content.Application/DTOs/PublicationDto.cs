namespace ResearchLms.Content.Application.DTOs;

public record PublicationDto(
    Guid Id,
    string Title,
    string[] Authors,
    string? Journal,
    string? Doi,
    string? PmId,
    DateTime? PublicationDate,
    string Type,
    string? Link,
    string? Abstract,
    string[] Attachments,
    bool IsVerified,
    DateTime CreatedAt
);
