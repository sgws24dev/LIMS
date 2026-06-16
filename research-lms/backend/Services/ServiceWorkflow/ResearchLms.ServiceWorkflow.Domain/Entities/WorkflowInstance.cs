using ResearchLms.ServiceWorkflow.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.ServiceWorkflow.Domain.Entities;

public class WorkflowInstance : BaseEntity
{
    public Guid WorkflowDefinitionId { get; private set; }
    public string EntityType { get; private set; }
    public Guid EntityId { get; private set; }
    public string CurrentState { get; set; }
    public string StateHistory { get; set; }
    public string? ContextData { get; set; }
    public WorkflowInstanceStatus Status { get; set; }

    public WorkflowDefinition WorkflowDefinition { get; private set; } = null!;

    public Guid TenantId { get; private set; }

    private WorkflowInstance() { EntityType = null!; CurrentState = null!; StateHistory = null!; }

    public WorkflowInstance(
        Guid workflowDefinitionId,
        string entityType,
        Guid entityId,
        string currentState,
        string createdBy)
    {
        WorkflowDefinitionId = workflowDefinitionId;
        EntityType = entityType;
        EntityId = entityId;
        CurrentState = currentState;
        StateHistory = "[]";
        Status = WorkflowInstanceStatus.Active;
        MarkCreated(createdBy);
    }
}
