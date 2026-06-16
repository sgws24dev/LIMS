using ResearchLms.ServiceWorkflow.Domain.Enums;
using ResearchLms.ServiceWorkflow.Domain.ValueObjects;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.ServiceWorkflow.Domain.Entities;

public class FormDefinition : BaseEntity
{
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public JsonSchema Schema { get; private set; }
    public int Version { get; private set; }
    public FormStatus Status { get; private set; }
    public string Category { get; private set; }

    private FormDefinition() { Title = null!; Schema = null!; Category = null!; }

    public FormDefinition(string title, string? description, JsonSchema schema, string category, string createdBy)
    {
        Title = title;
        Description = description;
        Schema = schema;
        Category = category;
        Version = 1;
        Status = FormStatus.Draft;
        MarkCreated(createdBy);
    }

    public void Update(string title, string? description, JsonSchema schema, string category, string modifiedBy)
    {
        Title = title;
        Description = description;
        Schema = schema;
        Category = category;
        Version++;
        MarkUpdated(modifiedBy);
    }

    public void Publish(string modifiedBy)
    {
        Status = FormStatus.Published;
        MarkUpdated(modifiedBy);
    }

    public void Archive(string modifiedBy)
    {
        Status = FormStatus.Archived;
        MarkUpdated(modifiedBy);
    }
}
