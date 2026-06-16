using ResearchLms.Shared.Abstractions;

namespace ResearchLms.ServiceWorkflow.Domain.Entities;

public class WorkflowDefinition : BaseEntity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string States { get; private set; }
    public string Transitions { get; private set; }
    public int Version { get; private set; }
    public bool IsPublished { get; private set; }
    public string? EntityTypeHint { get; private set; }

    public Guid TenantId { get; private set; }

    private WorkflowDefinition() { Name = null!; States = null!; Transitions = null!; }

    public WorkflowDefinition(
        string name,
        string? description,
        string states,
        string transitions,
        string? entityTypeHint,
        string createdBy)
    {
        Name = name;
        Description = description;
        States = states;
        Transitions = transitions;
        EntityTypeHint = entityTypeHint;
        Version = 1;
        IsPublished = false;
        MarkCreated(createdBy);
    }

    public void Update(string name, string? description, string states, string transitions, string? entityTypeHint, string modifiedBy)
    {
        Name = name;
        Description = description;
        States = states;
        Transitions = transitions;
        EntityTypeHint = entityTypeHint;
        Version++;
        MarkUpdated(modifiedBy);
    }

    public void Publish(string modifiedBy)
    {
        IsPublished = true;
        MarkUpdated(modifiedBy);
    }

    public void Unpublish(string modifiedBy)
    {
        IsPublished = false;
        MarkUpdated(modifiedBy);
    }
}
