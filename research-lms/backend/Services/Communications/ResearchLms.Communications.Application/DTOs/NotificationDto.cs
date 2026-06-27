namespace ResearchLms.Communications.Application.DTOs;

public record NotificationDto(
    Guid Id,
    Guid UserId,
    string Type,
    string Title,
    string Body,
    string? Link,
    bool IsRead,
    DateTime? ReadAt,
    DateTime CreatedAt
);
