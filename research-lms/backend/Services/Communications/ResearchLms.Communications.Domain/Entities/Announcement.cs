using ResearchLms.Communications.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Communications.Domain.Entities;

public class Announcement : BaseEntity
{
    public string Title { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    public AnnouncementPriority Priority { get; private set; }
    public string? TargetAudience { get; private set; }
    public DateTime ValidFrom { get; private set; }
    public DateTime ValidTo { get; private set; }

    protected Announcement() { }

    public Announcement(string title, string body, AnnouncementPriority priority, string? targetAudience, DateTime validFrom, DateTime validTo)
    {
        Title = title;
        Body = body;
        Priority = priority;
        TargetAudience = targetAudience;
        ValidFrom = validFrom;
        ValidTo = validTo;
    }

    public void Update(string title, string body, AnnouncementPriority priority, string? targetAudience, DateTime validFrom, DateTime validTo)
    {
        Title = title;
        Body = body;
        Priority = priority;
        TargetAudience = targetAudience;
        ValidFrom = validFrom;
        ValidTo = validTo;
    }
}
