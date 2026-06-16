using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Queries.WorkflowInstances;

public class GetAvailableTriggersQueryHandler
    : IRequestHandler<GetAvailableTriggersQuery, ApiResponse<IReadOnlyList<AvailableTriggerDto>>>
{
    private readonly IWorkflowExecutionService _executionService;

    public GetAvailableTriggersQueryHandler(IWorkflowExecutionService executionService)
    {
        _executionService = executionService;
    }

    public async Task<ApiResponse<IReadOnlyList<AvailableTriggerDto>>> Handle(
        GetAvailableTriggersQuery request, CancellationToken ct)
    {
        var triggers = await _executionService.GetAvailableTriggersAsync(request.InstanceId, ct);

        var dtos = triggers.Select(t => new AvailableTriggerDto(t.Trigger, t.ToState)).ToList();

        return new ApiResponse<IReadOnlyList<AvailableTriggerDto>>(true, dtos);
    }
}
