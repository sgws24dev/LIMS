namespace ResearchLms.ServiceWorkflow.Application.DTOs;

public record TransitionResultDto(
    bool Success,
    string? ErrorMessage,
    string? FromState,
    string? ToState,
    string? Trigger,
    List<AvailableTriggerDto>? AvailableTriggers);
