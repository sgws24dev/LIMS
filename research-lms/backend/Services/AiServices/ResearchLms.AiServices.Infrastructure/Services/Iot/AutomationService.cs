using System.Text.Json;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Enums;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Infrastructure.Services.Iot;

public class AutomationService : IAutomationService
{
    private readonly IAutomationActionLogRepository _logRepo;
    private readonly ITenantContext _tenant;
    private readonly ICurrentUser _user;

    public AutomationService(
        IAutomationActionLogRepository logRepo,
        ITenantContext tenant,
        ICurrentUser user)
    {
        _logRepo = logRepo;
        _tenant = tenant;
        _user = user;
    }

    public async Task<AutomationActionLog> ExecuteAsync(AutomationRule rule, string triggerEvent, CancellationToken ct = default)
    {
        var actionExecuted = rule.ActionType switch
        {
            AutomationActionType.SoftAction => ExecuteSoftAction(rule),
            AutomationActionType.HardAction when !rule.RequiresApproval => JsonSerializer.Serialize(new
            {
                status = "executed",
                action = rule.ActionConfig,
                timestamp = DateTime.UtcNow
            }),
            AutomationActionType.HardAction => JsonSerializer.Serialize(new
            {
                status = "pending_approval",
                action = rule.ActionConfig,
                message = "Hard action requires approval before execution."
            }),
            _ => JsonSerializer.Serialize(new { status = "unknown_action" })
        };

        var status = (rule.ActionType == AutomationActionType.HardAction && rule.RequiresApproval)
            ? "Pending" : "Completed";

        var log = new AutomationActionLog(rule.Id, triggerEvent, actionExecuted, status);
        log.SetTenant(_tenant.TenantId);
        log.MarkCreated(_user.Name);
        await _logRepo.AddAsync(log, ct);

        return log;
    }

    public async Task ApproveActionAsync(Guid logId, Guid approvedByUserId, CancellationToken ct = default)
    {
        var log = await _logRepo.GetByIdAsync(logId, ct);
        if (log == null) throw new KeyNotFoundException("Action log not found.");
        log.Approve(approvedByUserId);
        await _logRepo.UpdateAsync(log, ct);
    }

    public async Task RejectActionAsync(Guid logId, CancellationToken ct = default)
    {
        var log = await _logRepo.GetByIdAsync(logId, ct);
        if (log == null) throw new KeyNotFoundException("Action log not found.");
        log.Reject();
        await _logRepo.UpdateAsync(log, ct);
    }

    private static string ExecuteSoftAction(AutomationRule rule)
    {
        var action = JsonSerializer.Deserialize<JsonElement>(rule.ActionConfig);
        return action.TryGetProperty("command", out var cmd)
            ? JsonSerializer.Serialize(new { status = "executed", command = cmd.GetString(), timestamp = DateTime.UtcNow })
            : JsonSerializer.Serialize(new { status = "notified", timestamp = DateTime.UtcNow });
    }
}
