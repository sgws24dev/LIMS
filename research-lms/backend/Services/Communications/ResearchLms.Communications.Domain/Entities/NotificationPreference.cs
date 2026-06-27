using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Communications.Domain.Entities;

public class NotificationPreference : BaseEntity
{
    public Guid UserId { get; private set; }
    public string NotificationType { get; private set; } = string.Empty;
    public string ChannelsJson { get; private set; } = "[]";
    public bool IsOptedOut { get; private set; }

    protected NotificationPreference() { }

    public NotificationPreference(Guid userId, string notificationType, string[] channels, bool isOptedOut)
    {
        UserId = userId;
        NotificationType = notificationType;
        ChannelsJson = System.Text.Json.JsonSerializer.Serialize(channels);
        IsOptedOut = isOptedOut;
    }

    public string[] GetChannels()
    {
        return System.Text.Json.JsonSerializer.Deserialize<string[]>(ChannelsJson) ?? Array.Empty<string>();
    }

    public void UpdateChannels(string[] channels)
    {
        ChannelsJson = System.Text.Json.JsonSerializer.Serialize(channels);
    }

    public void SetOptedOut(bool optedOut)
    {
        IsOptedOut = optedOut;
    }
}
