using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Scheduling.Domain.Entities;

public class RecurringRule : BaseEntity
{
    public new Guid TenantId { get; set; }
    public Guid ResourceId { get; set; }
    public ResourceType ResourceType { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public RecurringFrequency Frequency { get; set; }
    public int DayOfWeekMask { get; set; }
    public TimeOnly TimeOfDay { get; set; }
    public int DurationMinutes { get; set; }
    public DateOnly EffectiveFrom { get; set; }
    public DateOnly? EffectiveTo { get; set; }
    public int? MaxInstances { get; set; } = 100;
    public RecurringRuleStatus Status { get; set; } = RecurringRuleStatus.Active;
    public DateOnly? LastGeneratedDate { get; set; }
    public int GeneratedCount { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
