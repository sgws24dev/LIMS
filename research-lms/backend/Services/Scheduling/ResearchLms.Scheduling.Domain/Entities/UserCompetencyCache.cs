namespace ResearchLms.Scheduling.Domain.Entities;

public class UserCompetencyCache
{
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public string CompetencyCode { get; set; } = string.Empty;
    public DateTime AwardedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string Source { get; set; } = string.Empty;
}
