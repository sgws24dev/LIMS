using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Commands.WorkflowDefinitions;

public class UpdateWorkflowDefinitionCommandHandler
    : IRequestHandler<UpdateWorkflowDefinitionCommand, ApiResponse<WorkflowDefinitionDto>>
{
    private readonly IWorkflowDefinitionRepository _repository;

    public UpdateWorkflowDefinitionCommandHandler(IWorkflowDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<WorkflowDefinitionDto>> Handle(
        UpdateWorkflowDefinitionCommand request, CancellationToken ct)
    {
        var definition = await _repository.GetByIdAsync(request.Id, ct);
        if (definition is null)
            return new ApiResponse<WorkflowDefinitionDto>(false, null, "Workflow definition not found.");

        definition.Update(request.Name, request.Description, request.States, request.Transitions,
            request.EntityTypeHint, request.UpdatedBy);

        await _repository.UpdateAsync(definition, ct);

        return new ApiResponse<WorkflowDefinitionDto>(true, new WorkflowDefinitionDto(
            definition.Id, definition.Name, definition.Description,
            definition.States, definition.Transitions,
            definition.IsPublished, definition.Version,
            definition.EntityTypeHint,
            definition.CreatedAt, definition.CreatedBy,
            definition.UpdatedAt, definition.UpdatedBy));
    }
}
