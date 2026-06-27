using ResearchLms.Communications.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Communications.Domain.Entities;

public class NotificationTemplate : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public NotificationChannel Channel { get; private set; }
    public string Subject { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    public bool IsDefault { get; private set; }

    protected NotificationTemplate() { }

    public NotificationTemplate(string name, NotificationChannel channel, string subject, string body, bool isDefault)
    {
        Name = name;
        Channel = channel;
        Subject = subject;
        Body = body;
        IsDefault = isDefault;
    }

    public void Update(string name, NotificationChannel channel, string subject, string body, bool isDefault)
    {
        Name = name;
        Channel = channel;
        Subject = subject;
        Body = body;
        IsDefault = isDefault;
    }
}
