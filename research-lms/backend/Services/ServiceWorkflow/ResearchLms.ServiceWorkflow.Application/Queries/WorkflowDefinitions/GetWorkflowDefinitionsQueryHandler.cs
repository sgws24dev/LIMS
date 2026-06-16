using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Queries.WorkflowDefinitions;

public class GetWorkflowDefinitionsQueryHandler
    : IRequestHandler<GetWorkflowDefinitionsQuery, ApiResponse<IReadOnlyList<WorkflowDefinitionDto>>>
{
    private readonly IWorkflowDefinitionRepository _repository;

    public GetWorkflowDefinitionsQueryHandler(IWorkflowDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<IReadOnlyList<WorkflowDefinitionDto>>> Handle(
        GetWorkflowDefinitionsQuery request, CancellationToken ct)
    {
        // Note: tenant filtering is handled by the query filter
        var definitions = await _repository.GetAllAsync(Guid.Empty, ct);

        var dtos = definitions.Select(d => new WorkflowDefinitionDto(
            d.Id, d.Name, d.Description, d.States, d.Transitions,
            d.IsPublished, d.Version, d.EntityTypeHint,
            d.CreatedAt, d.CreatedBy, d.UpdatedAt, d.UpdatedBy))
            .ToList();

        return new ApiResponse<IReadOnlyList<WorkflowDefinitionDto>>(true, dtos);
    }
}
