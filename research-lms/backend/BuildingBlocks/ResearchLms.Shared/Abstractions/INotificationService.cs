namespace ResearchLms.Shared.Abstractions;

public interface INotificationService
{
    Task SendAsync(NotificationMessage notification, CancellationToken ct = default);
    Task SendBulkAsync(IEnumerable<NotificationMessage> notifications, CancellationToken ct = default);
}

public class NotificationMessage
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? Link { get; set; }
    public string[] Channels { get; set; } = Array.Empty<string>();
    public string? EmailTo { get; set; }
    public string? EmailSubject { get; set; }
    public string? SmsTo { get; set; }
    public string? TeamsWebhookUrl { get; set; }
    public byte[]? Attachment { get; set; }
    public string? AttachmentName { get; set; }
    public string? AttachmentContentType { get; set; }
}
