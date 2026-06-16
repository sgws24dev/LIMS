using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Scheduling.Domain.Entities;

public class Booking : BaseEntity
{
    public Guid ResourceId { get; private set; }
    public ResourceType ResourceType { get; private set; }
    public Guid UserId { get; private set; }
    public string UserName { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public DateTime StartTime { get; private set; }
    public DateTime EndTime { get; private set; }
    public BookingStatus Status { get; private set; } = BookingStatus.Pending;
    public string? Purpose { get; private set; }
    public string? Notes { get; private set; }
    public decimal? Cost { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    public string? CancellationReason { get; private set; }
    public DateTime? CheckedInAt { get; private set; }
    public Guid? RecurringRuleId { get; set; }

    public BookingResource? BookingResource { get; private set; }
    public RecurringRule? RecurringRule { get; set; }

    protected Booking() { }

    public Booking(
        Guid resourceId,
        ResourceType resourceType,
        Guid userId,
        string userName,
        string title,
        DateTime startTime,
        DateTime endTime,
        string? purpose,
        string? notes)
    {
        ResourceId = resourceId;
        ResourceType = resourceType;
        UserId = userId;
        UserName = userName;
        Title = title;
        StartTime = startTime;
        EndTime = endTime;
        Purpose = purpose;
        Notes = notes;
        Status = BookingStatus.Pending;
    }

    public Booking(
        Guid resourceId,
        ResourceType resourceType,
        Guid userId,
        string userName,
        string title,
        DateTime startTime,
        DateTime endTime,
        string? purpose,
        string? notes,
        Guid? recurringRuleId,
        Guid tenantId)
        : this(resourceId, resourceType, userId, userName, title, startTime, endTime, purpose, notes)
    {
        RecurringRuleId = recurringRuleId;
        TenantId = tenantId;
        Status = BookingStatus.Confirmed;
    }

    public void Update(string title, DateTime startTime, DateTime endTime, string? purpose, string? notes)
    {
        Title = title;
        StartTime = startTime;
        EndTime = endTime;
        Purpose = purpose;
        Notes = notes;
    }

    public void Cancel(string? reason)
    {
        BookingStateMachine.ValidateTransition(Status, BookingStatus.Cancelled);
        Status = BookingStatus.Cancelled;
        CancelledAt = DateTime.UtcNow;
        CancellationReason = reason;
    }

    public void Confirm() =>
        BookingStateMachine.ValidateTransition(Status, BookingStatus.Confirmed);

    public void CheckIn()
    {
        BookingStateMachine.ValidateTransition(Status, BookingStatus.InProgress);
        Status = BookingStatus.InProgress;
        CheckedInAt = DateTime.UtcNow;
    }

    public void Complete() =>
        BookingStateMachine.ValidateTransition(Status, BookingStatus.Completed);

    public void MarkNoShow() =>
        BookingStateMachine.ValidateTransition(Status, BookingStatus.NoShow);

    public void SetCost(decimal cost) => Cost = cost;
}
