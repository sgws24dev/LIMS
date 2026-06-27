using ResearchLms.Shared.Abstractions;
using ResearchLms.Training.Domain.Enums;

namespace ResearchLms.Training.Domain.Entities;

public class UserCompetency : BaseEntity
{
    public Guid UserId { get; private set; }
    public Guid CompetencyId { get; private set; }
    public DateTime AchievedAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }
    public CompetencyStatus Status { get; private set; }
    public DateTime? RenewedAt { get; private set; }

    public Competency? Competency { get; private set; }

    protected UserCompetency() { }

    public UserCompetency(
        Guid userId,
        Guid competencyId,
        DateTime achievedAt,
        DateTime? expiresAt,
        CompetencyStatus status,
        DateTime? renewedAt)
    {
        UserId = userId;
        CompetencyId = competencyId;
        AchievedAt = achievedAt;
        ExpiresAt = expiresAt;
        Status = status;
        RenewedAt = renewedAt;
    }

    public void Renew(DateTime newExpiresAt)
    {
        ExpiresAt = newExpiresAt;
        Status = CompetencyStatus.Active;
        RenewedAt = DateTime.UtcNow;
    }
}
