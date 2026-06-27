namespace ResearchLms.Communications.Application.DTOs;

public record NotificationTemplateDto(
    Guid Id,
    string Name,
    string Channel,
    string Subject,
    string Body,
    bool IsDefault,
    DateTime CreatedAt
);
