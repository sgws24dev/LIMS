namespace ResearchLms.Content.Application.DTOs;

public record WalkthroughProgressDto(
    Guid WalkthroughId,
    int? CurrentStepIndex,
    string Status
);