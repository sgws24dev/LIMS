namespace ResearchLms.Content.Application.DTOs;

public record WalkthroughStepRequest(
    int StepOrder,
    string Title,
    string Content,
    string? ElementSelector,
    string Placement,
    string ActionType
);

public record CreateWalkthroughRequest(
    string Name,
    string TargetRoute,
    string Trigger,
    int Priority,
    bool IsActive,
    List<WalkthroughStepRequest> Steps
);
