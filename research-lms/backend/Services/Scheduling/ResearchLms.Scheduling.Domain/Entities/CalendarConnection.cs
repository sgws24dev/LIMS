using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Scheduling.Domain.Entities;

public class CalendarConnection : BaseEntity
{
    public new Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public SyncProvider Provider { get; set; }
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime TokenExpiresAt { get; set; }
    public string? ExternalCalendarId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastSyncAt { get; set; }
    public SyncDirection SyncDirection { get; set; } = SyncDirection.BiDirectional;

    public ICollection<CalendarSyncLog> SyncLogs { get; set; } = new List<CalendarSyncLog>();
}
