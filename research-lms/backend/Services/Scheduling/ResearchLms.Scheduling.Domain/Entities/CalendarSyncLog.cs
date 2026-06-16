using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Scheduling.Domain.Entities;

public class CalendarSyncLog : BaseEntity
{
    public Guid CalendarConnectionId { get; set; }
    public new Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public SyncProvider Provider { get; set; }
    public string Direction { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int EventsCreated { get; set; }
    public int EventsUpdated { get; set; }
    public int EventsDeleted { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime SyncedAt { get; set; } = DateTime.UtcNow;

    public CalendarConnection? CalendarConnection { get; set; }
}
