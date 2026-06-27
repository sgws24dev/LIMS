namespace ResearchLms.Training.Application.DTOs;

public record AssignCompetencyRequest(
    Guid UserId,
    Guid CompetencyId,
    DateTime AchievedAt,
    DateTime? ExpiresAt
);
