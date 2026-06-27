using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Domain.Entities;

public class ReportSchedule : BaseEntity
{
    public Guid ReportDefinitionId { get; private set; }
    public string CronExpression { get; private set; }
    public string TimeZoneId { get; private set; }
    public ReportFormat Format { get; private set; }
    public string Recipients { get; private set; }
    public string Subject { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime? LastDeliveredAt { get; private set; }
    public DateTime? NextRunAt { get; private set; }

    public ReportDefinition? ReportDefinition { get; private set; }

    private ReportSchedule() { CronExpression = null!; TimeZoneId = null!; Recipients = null!; Subject = null!; }

    public ReportSchedule(
        Guid reportDefinitionId,
        string cronExpression,
        string timeZoneId,
        ReportFormat format,
        string recipients,
        string subject,
        string createdBy)
    {
        ReportDefinitionId = reportDefinitionId;
        CronExpression = cronExpression;
        TimeZoneId = timeZoneId;
        Format = format;
        Recipients = recipients;
        Subject = subject;
        IsActive = true;
        MarkCreated(createdBy);
    }

    public void Update(
        string cronExpression,
        string timeZoneId,
        ReportFormat format,
        string recipients,
        string subject,
        bool isActive,
        string modifiedBy)
    {
        CronExpression = cronExpression;
        TimeZoneId = timeZoneId;
        Format = format;
        Recipients = recipients;
        Subject = subject;
        IsActive = isActive;
        MarkUpdated(modifiedBy);
    }

    public void MarkDelivered(DateTime deliveredAt)
    {
        LastDeliveredAt = deliveredAt;
    }

    public void SetNextRun(DateTime? nextRunAt)
    {
        NextRunAt = nextRunAt;
    }
}
