using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Commands.WorkflowDefinitions;

public class UnpublishWorkflowDefinitionCommandHandler
    : IRequestHandler<UnpublishWorkflowDefinitionCommand, ApiResponse<bool>>
{
    private readonly IWorkflowDefinitionRepository _repository;

    public UnpublishWorkflowDefinitionCommandHandler(IWorkflowDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<bool>> Handle(
        UnpublishWorkflowDefinitionCommand request, CancellationToken ct)
    {
        var definition = await _repository.GetByIdAsync(request.Id, ct);
        if (definition is null)
            return new ApiResponse<bool>(false, false, "Workflow definition not found.");

        var hasActive = await _repository.HasActiveInstancesAsync(request.Id, ct);
        if (hasActive)
            return new ApiResponse<bool>(false, false,
                "Cannot unpublish a workflow definition with active instances.");

        definition.Unpublish(request.UpdatedBy);
        await _repository.UpdateAsync(definition, ct);

        return new ApiResponse<bool>(true, true);
    }
}
