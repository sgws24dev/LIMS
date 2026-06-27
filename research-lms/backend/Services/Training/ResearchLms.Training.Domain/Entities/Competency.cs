using ResearchLms.Shared.Abstractions;
using ResearchLms.Training.Domain.Enums;

namespace ResearchLms.Training.Domain.Entities;

public class Competency : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public CompetencyCategory Category { get; private set; }
    public int ValidityPeriodDays { get; private set; }
    public bool RequiresRenewal { get; private set; }

    protected Competency() { }

    public Competency(
        string name,
        string description,
        CompetencyCategory category,
        int validityPeriodDays,
        bool requiresRenewal)
    {
        Name = name;
        Description = description;
        Category = category;
        ValidityPeriodDays = validityPeriodDays;
        RequiresRenewal = requiresRenewal;
    }

    public void Update(
        string name,
        string description,
        CompetencyCategory category,
        int validityPeriodDays,
        bool requiresRenewal)
    {
        Name = name;
        Description = description;
        Category = category;
        ValidityPeriodDays = validityPeriodDays;
        RequiresRenewal = requiresRenewal;
    }
}
