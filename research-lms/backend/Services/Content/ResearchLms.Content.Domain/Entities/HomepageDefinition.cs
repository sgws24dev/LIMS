using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Content.Domain.Entities;

public class HomepageDefinition : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    public string LayoutJson { get; private set; } = "[]";

    protected HomepageDefinition() { }

    public HomepageDefinition(string name, bool isActive, string layoutJson)
    {
        Name = name;
        IsActive = isActive;
        LayoutJson = layoutJson;
    }

    public void Update(string name, bool isActive, string layoutJson)
    {
        Name = name;
        IsActive = isActive;
        LayoutJson = layoutJson;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
