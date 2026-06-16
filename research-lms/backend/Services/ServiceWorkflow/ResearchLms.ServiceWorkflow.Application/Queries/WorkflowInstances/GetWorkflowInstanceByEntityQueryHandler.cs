using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Queries.WorkflowInstances;

public class GetWorkflowInstanceByEntityQueryHandler
    : IRequestHandler<GetWorkflowInstanceByEntityQuery, ApiResponse<WorkflowInstanceDto>>
{
    private readonly IWorkflowExecutionService _executionService;
    private readonly IWorkflowInstanceRepository _instanceRepository;

    public GetWorkflowInstanceByEntityQueryHandler(
        IWorkflowExecutionService executionService,
        IWorkflowInstanceRepository instanceRepository)
    {
        _executionService = executionService;
        _instanceRepository = instanceRepository;
    }

    public async Task<ApiResponse<WorkflowInstanceDto>> Handle(
        GetWorkflowInstanceByEntityQuery request, CancellationToken ct)
    {
        var instance = await _executionService.GetInstanceByEntityAsync(request.EntityType, request.EntityId, ct);
        if (instance is null)
            return new ApiResponse<WorkflowInstanceDto>(false, null, "No workflow instance found for this entity.");

        var history = System.Text.Json.JsonSerializer.Deserialize<List<ResearchLms.ServiceWorkflow.Domain.ValueObjects.StateTransitionRecord>>(
            instance.StateHistory) ?? new();

        return new ApiResponse<WorkflowInstanceDto>(true, new WorkflowInstanceDto(
            instance.Id, instance.WorkflowDefinitionId, instance.EntityType,
            instance.EntityId, instance.CurrentState, instance.Status.ToString(),
            history, instance.CreatedAt, instance.CreatedBy,
            instance.UpdatedAt, instance.UpdatedBy));
    }
}
