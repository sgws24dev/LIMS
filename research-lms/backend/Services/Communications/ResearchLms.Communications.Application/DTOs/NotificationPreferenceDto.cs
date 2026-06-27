namespace ResearchLms.Communications.Application.DTOs;

public record NotificationPreferenceDto(
    Guid Id,
    string NotificationType,
    string[] Channels,
    bool IsOptedOut
);
