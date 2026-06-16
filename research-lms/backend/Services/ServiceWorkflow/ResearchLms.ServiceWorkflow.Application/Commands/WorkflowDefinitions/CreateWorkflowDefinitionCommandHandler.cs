using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Commands.WorkflowDefinitions;

public class CreateWorkflowDefinitionCommandHandler
    : IRequestHandler<CreateWorkflowDefinitionCommand, ApiResponse<WorkflowDefinitionDto>>
{
    private readonly IWorkflowDefinitionRepository _repository;

    public CreateWorkflowDefinitionCommandHandler(IWorkflowDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<WorkflowDefinitionDto>> Handle(
        CreateWorkflowDefinitionCommand request, CancellationToken ct)
    {
        var definition = new WorkflowDefinition(
            request.Name,
            request.Description,
            request.States,
            request.Transitions,
            request.EntityTypeHint,
            request.CreatedBy);

        await _repository.AddAsync(definition, ct);

        return new ApiResponse<WorkflowDefinitionDto>(true, new WorkflowDefinitionDto(
            definition.Id, definition.Name, definition.Description,
            definition.States, definition.Transitions,
            definition.IsPublished, definition.Version,
            definition.EntityTypeHint,
            definition.CreatedAt, definition.CreatedBy,
            definition.UpdatedAt, definition.UpdatedBy));
    }
}
