using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Commands.WorkflowDefinitions;

public class PublishWorkflowDefinitionCommandHandler
    : IRequestHandler<PublishWorkflowDefinitionCommand, ApiResponse<bool>>
{
    private readonly IWorkflowDefinitionRepository _repository;

    public PublishWorkflowDefinitionCommandHandler(IWorkflowDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<bool>> Handle(
        PublishWorkflowDefinitionCommand request, CancellationToken ct)
    {
        var definition = await _repository.GetByIdAsync(request.Id, ct);
        if (definition is null)
            return new ApiResponse<bool>(false, false, "Workflow definition not found.");

        definition.Publish(request.UpdatedBy);
        await _repository.UpdateAsync(definition, ct);

        return new ApiResponse<bool>(true, true);
    }
}
