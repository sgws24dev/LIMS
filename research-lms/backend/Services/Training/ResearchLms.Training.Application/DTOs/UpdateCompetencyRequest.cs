using ResearchLms.Training.Domain.Enums;

namespace ResearchLms.Training.Application.DTOs;

public record UpdateCompetencyRequest(
    string Name,
    string Description,
    CompetencyCategory Category,
    int ValidityPeriodDays,
    bool RequiresRenewal
);
