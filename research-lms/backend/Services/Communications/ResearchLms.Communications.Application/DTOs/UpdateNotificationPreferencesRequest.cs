namespace ResearchLms.Communications.Application.DTOs;

public record UpdateNotificationPreferencesRequest(
    string NotificationType,
    string[] Channels,
    bool IsOptedOut
);
