namespace ResearchLms.AiServices.Application.DTOs;

public record IoTTelemetryDto(
    Guid Id, Guid InstrumentId, DateTime Timestamp, string MetricName,
    double MetricValue, string Unit, string? Tags
);

public record IoTAlertDto(
    Guid Id, Guid InstrumentId, Guid? RuleId, string MetricName,
    double ActualValue, double ThresholdValue, string Severity,
    string Status, DateTime OpenedAt, DateTime? AcknowledgedAt,
    DateTime? ResolvedAt, Guid? ResolvedByUserId
);

public record AlertRuleDto(
    Guid Id, Guid InstrumentId, string MetricName, string ConditionType,
    double ThresholdValue, int EvaluationWindowMinutes, string Severity,
    int CooldownMinutes, bool IsEnabled
);

public record CreateAlertRuleRequest(
    Guid InstrumentId, string MetricName, string ConditionType,
    double ThresholdValue, int EvaluationWindowMinutes, string Severity,
    int CooldownMinutes
);

public record AutomationRuleDto(
    Guid Id, string Name, string TriggerType, string TriggerConfig,
    string ActionType, string ActionConfig, bool RequiresApproval, bool IsEnabled
);

public record CreateAutomationRuleRequest(
    string Name, string TriggerType, string TriggerConfig,
    string ActionType, string ActionConfig, bool RequiresApproval
);

public record PendingActionDto(
    Guid Id, Guid RuleId, string RuleName, string TriggerEvent,
    string ActionExecuted, DateTime ExecutedAt
);

public record InstrumentStatusDto(
    Guid InstrumentId, string Status, IoTTelemetryDto? LatestTelemetry,
    IoTAlertDto? ActiveAlert
);

public record TelemetryQueryRequest(
    Guid InstrumentId, string? MetricName, DateTime? From, DateTime? To
);

public record IngestTelemetryRequest(
    Guid InstrumentId, DateTime Timestamp, string MetricName,
    double MetricValue, string Unit, string? Tags
);
