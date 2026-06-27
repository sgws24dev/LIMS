using ResearchLms.Training.Domain.Enums;

namespace ResearchLms.Training.Application.DTOs;

public record CompetencyDto(
    Guid Id,
    string Name,
    string Description,
    CompetencyCategory Category,
    int ValidityPeriodDays,
    bool RequiresRenewal,
    DateTime CreatedAt
);
