using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Queries.FormDefinitions;

public class GetFormDefinitionsQueryHandler : IRequestHandler<GetFormDefinitionsQuery, ApiResponse<IReadOnlyList<FormDefinitionDto>>>
{
    private readonly IFormDefinitionRepository _repository;

    public GetFormDefinitionsQueryHandler(IFormDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<IReadOnlyList<FormDefinitionDto>>> Handle(GetFormDefinitionsQuery request, CancellationToken ct)
    {
        var forms = request.PublishedOnly == true
            ? await _repository.GetPublishedAsync(request.TenantId, ct)
            : await _repository.GetAllAsync(request.TenantId, ct);

        var dtos = forms.Select(f => new FormDefinitionDto(
            f.Id, f.Title, f.Description, f.Schema, f.Fields,
            f.Version, f.Status.ToString(), f.Category,
            f.CreatedAt, f.CreatedBy, f.UpdatedAt, f.UpdatedBy
        )).ToList();

        return new ApiResponse<IReadOnlyList<FormDefinitionDto>>(true, dtos);
    }
}
