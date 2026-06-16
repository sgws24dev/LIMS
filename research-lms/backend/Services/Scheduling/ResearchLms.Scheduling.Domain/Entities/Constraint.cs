using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Scheduling.Domain.Entities;

public class Constraint : BaseEntity
{
    public Guid ResourceId { get; set; }
    public ResourceType ResourceType { get; set; }
    public ConstraintType Type { get; set; }
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public string? ErrorMessage { get; set; }
}
