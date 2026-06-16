namespace ResearchLms.Shared.Domain.Entities;

public class InstitutionSettings
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public string? LogoUrl { get; set; }
    public string? PrimaryColor { get; set; }
    public string? Timezone { get; set; }
    public string? DateFormat { get; set; }
    public Dictionary<string, string> CustomSettings { get; set; } = [];

    private InstitutionSettings() { }

    public InstitutionSettings(Guid tenantId)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
    }
}
