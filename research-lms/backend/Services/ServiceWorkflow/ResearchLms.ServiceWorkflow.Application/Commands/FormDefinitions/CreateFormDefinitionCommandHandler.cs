using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Domain.ValueObjects;

namespace ResearchLms.ServiceWorkflow.Application.Commands.FormDefinitions;

public class CreateFormDefinitionCommandHandler : IRequestHandler<CreateFormDefinitionCommand, ApiResponse<FormDefinitionDto>>
{
    private readonly IFormDefinitionRepository _repository;

    public CreateFormDefinitionCommandHandler(IFormDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<FormDefinitionDto>> Handle(CreateFormDefinitionCommand request, CancellationToken ct)
    {
        var schema = new JsonSchema(request.Schema);

        var form = new FormDefinition(
            request.Title,
            request.Description,
            schema,
            request.Fields,
            request.Category,
            request.CreatedBy);

        await _repository.AddAsync(form, ct);

        return new ApiResponse<FormDefinitionDto>(true, new FormDefinitionDto(
            form.Id,
            form.Title,
            form.Description,
            form.Schema,
            form.Fields,
            form.Version,
            form.Status.ToString(),
            form.Category,
            form.CreatedAt,
            form.CreatedBy,
            form.UpdatedAt,
            form.UpdatedBy
        ));
    }
}
