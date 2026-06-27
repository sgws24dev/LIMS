namespace ResearchLms.Training.Application.DTOs;

public record ValidatePrerequisitesRequest(
    Guid UserId,
    Guid? InstrumentId
);
