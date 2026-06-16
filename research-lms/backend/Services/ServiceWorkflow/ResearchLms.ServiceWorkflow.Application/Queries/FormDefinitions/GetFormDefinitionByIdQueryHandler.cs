using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Exceptions;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Queries.FormDefinitions;

public class GetFormDefinitionByIdQueryHandler : IRequestHandler<GetFormDefinitionByIdQuery, ApiResponse<FormDefinitionDto>>
{
    private readonly IFormDefinitionRepository _repository;

    public GetFormDefinitionByIdQueryHandler(IFormDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<FormDefinitionDto>> Handle(GetFormDefinitionByIdQuery request, CancellationToken ct)
    {
        var form = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.FormDefinition), request.Id);

        return new ApiResponse<FormDefinitionDto>(true, new FormDefinitionDto(
            form.Id, form.Title, form.Description, form.Schema,
            form.Version, form.Status.ToString(), form.Category,
            form.CreatedAt, form.CreatedBy, form.UpdatedAt, form.UpdatedBy
        ));
    }
}
