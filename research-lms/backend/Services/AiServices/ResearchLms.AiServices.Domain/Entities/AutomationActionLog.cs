using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Domain.Entities;

public class AutomationActionLog : BaseEntity
{
    public Guid RuleId { get; private set; }
    public string TriggerEvent { get; private set; } = "{}";
    public string ActionExecuted { get; private set; } = "{}";
    public string Status { get; private set; } = "Pending";
    public Guid? ApprovedByUserId { get; private set; }
    public DateTime ExecutedAt { get; private set; }

    protected AutomationActionLog() { }

    public AutomationActionLog(Guid ruleId, string triggerEvent, string actionExecuted, string status)
    {
        RuleId = ruleId;
        TriggerEvent = triggerEvent;
        ActionExecuted = actionExecuted;
        Status = status;
        ExecutedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approvedByUserId)
    {
        Status = "Approved";
        ApprovedByUserId = approvedByUserId;
    }

    public void Reject()
    {
        Status = "Rejected";
    }
}
