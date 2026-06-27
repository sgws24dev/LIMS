using ResearchLms.Training.Domain.Enums;

namespace ResearchLms.Training.Application.DTOs;

public record UserCompetencyDto(
    Guid Id,
    Guid UserId,
    Guid CompetencyId,
    string CompetencyName,
    DateTime AchievedAt,
    DateTime? ExpiresAt,
    CompetencyStatus Status,
    DateTime? RenewedAt
);
