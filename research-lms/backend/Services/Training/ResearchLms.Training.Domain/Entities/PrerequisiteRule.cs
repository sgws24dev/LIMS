namespace ResearchLms.Training.Domain.Entities;

public class PrerequisiteRule
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid? InstrumentId { get; private set; }
    public Guid CompetencyId { get; private set; }

    public Competency? Competency { get; private set; }

    protected PrerequisiteRule() { }

    public PrerequisiteRule(
        Guid tenantId,
        Guid? instrumentId,
        Guid competencyId)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        InstrumentId = instrumentId;
        CompetencyId = competencyId;
    }
}
