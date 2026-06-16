using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Domain.Entities;

public class CalendarEventMapping
{
    public Guid BookingId { get; set; }
    public SyncProvider Provider { get; set; }
    public string ExternalEventId { get; set; } = string.Empty;
}
