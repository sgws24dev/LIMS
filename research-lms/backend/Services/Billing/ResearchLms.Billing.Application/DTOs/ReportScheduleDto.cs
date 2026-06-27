using ResearchLms.Billing.Domain.Enums;

namespace ResearchLms.Billing.Application.DTOs;

public class ReportScheduleDto
{
    public Guid Id { get; set; }
    public Guid ReportDefinitionId { get; set; }
    public string? ReportDefinitionName { get; set; }
    public string CronExpression { get; set; } = string.Empty;
    public string TimeZoneId { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public string Recipients { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? LastDeliveredAt { get; set; }
    public DateTime? NextRunAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateReportScheduleDto
{
    public Guid ReportDefinitionId { get; set; }
    public string CronExpression { get; set; } = string.Empty;
    public string TimeZoneId { get; set; } = "UTC";
    public string Format { get; set; } = "Pdf";
    public string Recipients { get; set; } = "[]";
    public string Subject { get; set; } = "{{ReportName}} - {{Date}}";
}

public class UpdateReportScheduleDto
{
    public Guid Id { get; set; }
    public string CronExpression { get; set; } = string.Empty;
    public string TimeZoneId { get; set; } = "UTC";
    public string Format { get; set; } = "Pdf";
    public string Recipients { get; set; } = "[]";
    public string Subject { get; set; } = "{{ReportName}} - {{Date}}";
    public bool IsActive { get; set; } = true;
}
