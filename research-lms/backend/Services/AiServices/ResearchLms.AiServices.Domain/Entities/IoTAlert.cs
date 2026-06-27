using ResearchLms.AiServices.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Domain.Entities;

public class IoTAlert : BaseEntity
{
    public Guid InstrumentId { get; private set; }
    public Guid? RuleId { get; private set; }
    public string MetricName { get; private set; } = string.Empty;
    public double ActualValue { get; private set; }
    public double ThresholdValue { get; private set; }
    public AlertSeverity Severity { get; private set; }
    public AlertStatus Status { get; private set; }
    public DateTime OpenedAt { get; private set; }
    public DateTime? AcknowledgedAt { get; private set; }
    public DateTime? ResolvedAt { get; private set; }
    public Guid? ResolvedByUserId { get; private set; }

    protected IoTAlert() { }

    public IoTAlert(Guid instrumentId, Guid? ruleId, string metricName, double actualValue,
        double thresholdValue, AlertSeverity severity)
    {
        InstrumentId = instrumentId;
        RuleId = ruleId;
        MetricName = metricName;
        ActualValue = actualValue;
        ThresholdValue = thresholdValue;
        Severity = severity;
        Status = AlertStatus.Open;
        OpenedAt = DateTime.UtcNow;
    }

    public void Acknowledge()
    {
        if (Status == AlertStatus.Open)
        {
            Status = AlertStatus.Acknowledged;
            AcknowledgedAt = DateTime.UtcNow;
        }
    }

    public void Resolve(Guid resolvedByUserId)
    {
        Status = AlertStatus.Resolved;
        ResolvedAt = DateTime.UtcNow;
        ResolvedByUserId = resolvedByUserId;
    }

    public void Snooze()
    {
        Status = AlertStatus.Snoozed;
    }
}
