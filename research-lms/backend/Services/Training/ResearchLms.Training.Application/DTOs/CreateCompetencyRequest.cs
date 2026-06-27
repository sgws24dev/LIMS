using ResearchLms.Training.Domain.Enums;

namespace ResearchLms.Training.Application.DTOs;

public record CreateCompetencyRequest(
    string Name,
    string Description,
    CompetencyCategory Category,
    int ValidityPeriodDays,
    bool RequiresRenewal
);
