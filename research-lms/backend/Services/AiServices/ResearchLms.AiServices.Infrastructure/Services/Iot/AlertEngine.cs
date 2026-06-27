using System.Collections.Concurrent;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Enums;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Domain.ValueObjects;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Infrastructure.Services.Iot;

public class AlertEngine : IAlertEngine
{
    private readonly IIoTRuleRepository _ruleRepo;
    private readonly IIoTAlertRepository _alertRepo;
    private readonly IIoTTelemetryRepository _telemetryRepo;
    private readonly ITenantContext _tenant;
    private readonly ICurrentUser _user;

    private static readonly ConcurrentDictionary<string, DateTime> LastAlertTimes = new();

    public AlertEngine(
        IIoTRuleRepository ruleRepo,
        IIoTAlertRepository alertRepo,
        IIoTTelemetryRepository telemetryRepo,
        ITenantContext tenant,
        ICurrentUser user)
    {
        _ruleRepo = ruleRepo;
        _alertRepo = alertRepo;
        _telemetryRepo = telemetryRepo;
        _tenant = tenant;
        _user = user;
    }

    public async Task EvaluateAsync(IoTTelemetryPoint point, CancellationToken ct = default)
    {
        var rules = await _ruleRepo.GetByTenantAsync(_tenant.TenantId, point.InstrumentId, ct);
        var applicable = rules.Where(r => r.IsEnabled &&
            r.MetricName.Equals(point.MetricName, StringComparison.OrdinalIgnoreCase));

        foreach (var rule in applicable)
        {
            var breached = await EvaluateRuleAsync(rule, point, ct);
            if (breached)
            {
                var cooldownKey = $"{rule.Id}_{point.InstrumentId}_{point.MetricName}";
                if (LastAlertTimes.TryGetValue(cooldownKey, out var lastAlert) &&
                    (DateTime.UtcNow - lastAlert).TotalMinutes < rule.CooldownMinutes)
                    continue;

                var alert = new IoTAlert(
                    point.InstrumentId, rule.Id, point.MetricName,
                    point.MetricValue, rule.ThresholdValue, rule.Severity);
                alert.SetTenant(_tenant.TenantId);
                alert.MarkCreated(_user.Name);
                await _alertRepo.AddAsync(alert, ct);
                LastAlertTimes[cooldownKey] = DateTime.UtcNow;
            }
        }
    }

    public async Task<IReadOnlyList<IoTAlert>> GetActiveAlertsAsync(Guid tenantId, CancellationToken ct = default)
    {
        return await _alertRepo.GetByTenantAsync(tenantId, status: "Open", ct: ct);
    }

    private async Task<bool> EvaluateRuleAsync(IoTRule rule, IoTTelemetryPoint point, CancellationToken ct)
    {
        switch (rule.ConditionType)
        {
            case ConditionType.AbsoluteAbove:
                return point.MetricValue > rule.ThresholdValue;

            case ConditionType.AbsoluteBelow:
                return point.MetricValue < rule.ThresholdValue;

            case ConditionType.RateOfIncrease:
            case ConditionType.RateOfDecrease:
                return await EvaluateRateAsync(rule, point, ct);

            case ConditionType.DeviationFromAvg:
                return await EvaluateDeviationAsync(rule, point, ct);

            default:
                return false;
        }
    }

    private async Task<bool> EvaluateRateAsync(IoTRule rule, IoTTelemetryPoint point, CancellationToken ct)
    {
        var windowStart = point.Timestamp.AddMinutes(-rule.EvaluationWindowMinutes);
        var history = await _telemetryRepo.GetByInstrumentAsync(
            _tenant.TenantId, point.InstrumentId, point.MetricName,
            windowStart, point.Timestamp, ct: ct);

        if (history.Count < 2) return false;

        var sorted = history.OrderBy(h => h.Timestamp).ToList();
        var first = sorted.First();
        var last = sorted.Last();
        var timeSpan = (last.Timestamp - first.Timestamp).TotalMinutes;
        if (timeSpan < 1) return false;

        var rate = (last.MetricValue - first.MetricValue) / timeSpan;

        return rule.ConditionType switch
        {
            ConditionType.RateOfIncrease => Math.Abs(rate) > rule.ThresholdValue && rate > 0,
            ConditionType.RateOfDecrease => Math.Abs(rate) > rule.ThresholdValue && rate < 0,
            _ => false
        };
    }

    private async Task<bool> EvaluateDeviationAsync(IoTRule rule, IoTTelemetryPoint point, CancellationToken ct)
    {
        var windowStart = point.Timestamp.AddMinutes(-rule.EvaluationWindowMinutes);
        var history = await _telemetryRepo.GetByInstrumentAsync(
            _tenant.TenantId, point.InstrumentId, point.MetricName,
            windowStart, point.Timestamp, ct: ct);

        if (history.Count == 0) return false;

        var avg = history.Average(h => h.MetricValue);
        return Math.Abs(point.MetricValue - avg) > rule.ThresholdValue;
    }
}
