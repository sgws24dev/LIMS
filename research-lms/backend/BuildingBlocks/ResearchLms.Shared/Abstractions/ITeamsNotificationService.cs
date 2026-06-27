namespace ResearchLms.Shared.Abstractions;

public enum MessageCardColor
{
    Default,
    Green,
    Red,
    Yellow
}

public interface ITeamsNotificationService
{
    Task SendAsync(string webhookUrl, string title, string message, MessageCardColor color = MessageCardColor.Default, CancellationToken ct = default);
}
