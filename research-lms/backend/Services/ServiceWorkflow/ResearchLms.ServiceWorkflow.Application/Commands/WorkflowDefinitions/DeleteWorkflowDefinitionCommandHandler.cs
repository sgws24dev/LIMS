using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Commands.WorkflowDefinitions;

public class DeleteWorkflowDefinitionCommandHandler
    : IRequestHandler<DeleteWorkflowDefinitionCommand, ApiResponse<bool>>
{
    private readonly IWorkflowDefinitionRepository _repository;

    public DeleteWorkflowDefinitionCommandHandler(IWorkflowDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<bool>> Handle(
        DeleteWorkflowDefinitionCommand request, CancellationToken ct)
    {
        var definition = await _repository.GetByIdAsync(request.Id, ct);
        if (definition is null)
            return new ApiResponse<bool>(false, false, "Workflow definition not found.");

        definition.MarkDeleted(request.DeletedBy);
        await _repository.UpdateAsync(definition, ct);

        return new ApiResponse<bool>(true, true);
    }
}
