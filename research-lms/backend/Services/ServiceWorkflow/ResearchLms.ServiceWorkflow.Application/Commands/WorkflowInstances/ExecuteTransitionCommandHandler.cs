using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Commands.WorkflowInstances;

public class ExecuteTransitionCommandHandler
    : IRequestHandler<ExecuteTransitionCommand, ApiResponse<TransitionResultDto>>
{
    private readonly IWorkflowExecutionService _executionService;

    public ExecuteTransitionCommandHandler(IWorkflowExecutionService executionService)
    {
        _executionService = executionService;
    }

    public async Task<ApiResponse<TransitionResultDto>> Handle(
        ExecuteTransitionCommand request, CancellationToken ct)
    {
        var result = await _executionService.ExecuteTransitionAsync(
            request.InstanceId,
            request.Trigger,
            request.TriggeredBy,
            request.Comment,
            request.AdditionalContext,
            ct);

        if (!result.IsSuccess)
            return new ApiResponse<TransitionResultDto>(false, new TransitionResultDto(
                false, result.ErrorMessage, result.FromState, result.ToState, result.Trigger, null),
                result.ErrorMessage);

        var triggers = await _executionService.GetAvailableTriggersAsync(request.InstanceId, ct);
        var triggerDtos = triggers.Select(t => new AvailableTriggerDto(t.Trigger, t.ToState)).ToList();

        return new ApiResponse<TransitionResultDto>(true, new TransitionResultDto(
            true, null, result.FromState, result.ToState, result.Trigger, triggerDtos));
    }
}
