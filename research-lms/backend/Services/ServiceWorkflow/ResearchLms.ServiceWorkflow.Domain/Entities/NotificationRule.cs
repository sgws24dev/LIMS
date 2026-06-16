using ResearchLms.ServiceWorkflow.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.ServiceWorkflow.Domain.Entities;

public class NotificationRule : BaseEntity
{
    public Guid WorkflowDefinitionId { get; private set; }
    public string Trigger { get; private set; }
    public NotificationChannel Channel { get; private set; }
    public string Subject { get; private set; }
    public string Body { get; private set; }
    public string Recipients { get; private set; }
    public bool IsActive { get; private set; }

    public Guid TenantId { get; private set; }

    private NotificationRule() { Trigger = null!; Subject = null!; Body = null!; Recipients = null!; }

    public NotificationRule(
        Guid workflowDefinitionId,
        string trigger,
        NotificationChannel channel,
        string subject,
        string body,
        string recipients,
        string createdBy)
    {
        WorkflowDefinitionId = workflowDefinitionId;
        Trigger = trigger;
        Channel = channel;
        Subject = subject;
        Body = body;
        Recipients = recipients;
        IsActive = true;
        MarkCreated(createdBy);
    }

    public void Deactivate(string modifiedBy)
    {
        IsActive = false;
        MarkUpdated(modifiedBy);
    }
}
