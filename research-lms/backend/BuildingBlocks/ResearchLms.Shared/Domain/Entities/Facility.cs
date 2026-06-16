using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Shared.Domain.Entities;

public class Facility : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Type { get; private set; } = "research_lab";
    public string? Location { get; private set; }
    public bool IsActive { get; private set; } = true;

    private Facility() { }

    public Facility(string name, string type, string? location)
    {
        Name = name;
        Type = type;
        Location = location;
        IsActive = true;
    }

    public void Update(string name, string type, string? location, bool isActive)
    {
        Name = name;
        Type = type;
        Location = location;
        IsActive = isActive;
    }
}
