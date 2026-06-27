namespace ResearchLms.Training.Application.DTOs;

public record CreatePrerequisiteRuleRequest(
    Guid InstrumentId,
    Guid CompetencyId
);
