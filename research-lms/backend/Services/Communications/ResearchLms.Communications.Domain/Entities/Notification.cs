using ResearchLms.Communications.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Communications.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; private set; }
    public string Type { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    public string? Link { get; private set; }
    public bool IsRead { get; private set; }
    public DateTime? ReadAt { get; private set; }

    protected Notification() { }

    public Notification(Guid userId, string type, string title, string body, string? link)
    {
        UserId = userId;
        Type = type;
        Title = title;
        Body = body;
        Link = link;
        IsRead = false;
    }

    public void MarkAsRead()
    {
        IsRead = true;
        ReadAt = DateTime.UtcNow;
    }
}
