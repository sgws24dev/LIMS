namespace ResearchLms.Content.Application.DTOs;

public record WalkthroughStepDto(
    Guid Id,
    int StepOrder,
    string Title,
    string Content,
    string? ElementSelector,
    string Placement,
    string ActionType
);

public record WalkthroughDto(
    Guid Id,
    string Name,
    string TargetRoute,
    string Trigger,
    int Priority,
    bool IsActive,
    List<WalkthroughStepDto> Steps
);
