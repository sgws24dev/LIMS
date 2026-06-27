using ResearchLms.AiServices.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Domain.Entities;

public class IoTRule : BaseEntity
{
    public Guid InstrumentId { get; private set; }
    public string MetricName { get; private set; } = string.Empty;
    public ConditionType ConditionType { get; private set; }
    public double ThresholdValue { get; private set; }
    public int EvaluationWindowMinutes { get; private set; }
    public AlertSeverity Severity { get; private set; }
    public int CooldownMinutes { get; private set; }
    public bool IsEnabled { get; private set; }

    protected IoTRule() { }

    public IoTRule(Guid instrumentId, string metricName, ConditionType conditionType, double thresholdValue,
        int evaluationWindowMinutes, AlertSeverity severity, int cooldownMinutes)
    {
        InstrumentId = instrumentId;
        MetricName = metricName;
        ConditionType = conditionType;
        ThresholdValue = thresholdValue;
        EvaluationWindowMinutes = evaluationWindowMinutes;
        Severity = severity;
        CooldownMinutes = cooldownMinutes;
        IsEnabled = true;
    }

    public void Update(string metricName, ConditionType conditionType, double thresholdValue,
        int evaluationWindowMinutes, AlertSeverity severity, int cooldownMinutes)
    {
        MetricName = metricName;
        ConditionType = conditionType;
        ThresholdValue = thresholdValue;
        EvaluationWindowMinutes = evaluationWindowMinutes;
        Severity = severity;
        CooldownMinutes = cooldownMinutes;
    }

    public void SetEnabled(bool enabled) => IsEnabled = enabled;
}
