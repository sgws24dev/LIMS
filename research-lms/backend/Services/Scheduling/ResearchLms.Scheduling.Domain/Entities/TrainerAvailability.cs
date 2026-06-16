using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Scheduling.Domain.Entities;

public class TrainerAvailability : BaseEntity
{
    public new Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public DayOfWeek DayOfWeek { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public bool IsAvailable { get; set; }
    public DateOnly EffectiveFrom { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly? EffectiveTo { get; set; }
    public AvailabilitySource Source { get; set; } = AvailabilitySource.Manual;
    public string? ExternalEventId { get; set; }
    public string? Notes { get; set; }
}
