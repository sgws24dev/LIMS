namespace ResearchLms.Communications.Application.DTOs;

public record CreateAnnouncementRequest(
    string Title,
    string Body,
    string Priority,
    string? TargetAudience,
    DateTime ValidFrom,
    DateTime ValidTo
);
