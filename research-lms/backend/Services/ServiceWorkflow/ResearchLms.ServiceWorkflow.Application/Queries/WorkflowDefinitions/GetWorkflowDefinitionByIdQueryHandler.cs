using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Queries.WorkflowDefinitions;

public class GetWorkflowDefinitionByIdQueryHandler
    : IRequestHandler<GetWorkflowDefinitionByIdQuery, ApiResponse<WorkflowDefinitionDto>>
{
    private readonly IWorkflowDefinitionRepository _repository;

    public GetWorkflowDefinitionByIdQueryHandler(IWorkflowDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<WorkflowDefinitionDto>> Handle(
        GetWorkflowDefinitionByIdQuery request, CancellationToken ct)
    {
        var definition = await _repository.GetByIdAsync(request.Id, ct);
        if (definition is null)
            return new ApiResponse<WorkflowDefinitionDto>(false, null, "Workflow definition not found.");

        return new ApiResponse<WorkflowDefinitionDto>(true, new WorkflowDefinitionDto(
            definition.Id, definition.Name, definition.Description,
            definition.States, definition.Transitions,
            definition.IsPublished, definition.Version,
            definition.EntityTypeHint,
            definition.CreatedAt, definition.CreatedBy,
            definition.UpdatedAt, definition.UpdatedBy));
    }
}
