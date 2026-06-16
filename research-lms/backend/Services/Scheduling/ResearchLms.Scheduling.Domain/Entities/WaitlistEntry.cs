using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Scheduling.Domain.Entities;

public class WaitlistEntry : BaseEntity
{
    public new Guid TenantId { get; set; }
    public Guid ResourceId { get; set; }
    public ResourceType ResourceType { get; set; }
    public DateOnly RequestedDate { get; set; }
    public TimeOnly RequestedStartTime { get; set; }
    public TimeOnly RequestedEndTime { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int Priority { get; set; }
    public WaitlistStatus Status { get; set; } = WaitlistStatus.Waiting;
    public DateTime? PromotedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public Guid? ProvisionalBookingId { get; set; }
    public string? Notes { get; set; }
}
