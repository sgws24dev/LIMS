namespace ResearchLms.Communications.Application.DTOs;

public record AnnouncementDto(
    Guid Id,
    string Title,
    string Body,
    string Priority,
    string? TargetAudience,
    DateTime ValidFrom,
    DateTime ValidTo,
    DateTime CreatedAt
);
