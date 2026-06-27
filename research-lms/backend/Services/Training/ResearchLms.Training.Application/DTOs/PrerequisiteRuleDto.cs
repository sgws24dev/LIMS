namespace ResearchLms.Training.Application.DTOs;

public record PrerequisiteRuleDto(
    Guid Id,
    Guid? InstrumentId,
    Guid CompetencyId,
    string CompetencyName
);
