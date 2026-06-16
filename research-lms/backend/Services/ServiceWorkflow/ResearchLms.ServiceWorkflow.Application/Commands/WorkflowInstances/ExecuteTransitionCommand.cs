using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.WorkflowInstances;

public record ExecuteTransitionCommand(
    Guid InstanceId,
    string Trigger,
    string? TriggeredBy,
    string? Comment,
    Dictionary<string, object>? AdditionalContext
) : IRequest<ApiResponse<TransitionResultDto>>;
