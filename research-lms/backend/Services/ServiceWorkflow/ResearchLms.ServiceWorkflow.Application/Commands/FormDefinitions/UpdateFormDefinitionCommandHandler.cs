using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Exceptions;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Domain.ValueObjects;

namespace ResearchLms.ServiceWorkflow.Application.Commands.FormDefinitions;

public class UpdateFormDefinitionCommandHandler : IRequestHandler<UpdateFormDefinitionCommand, ApiResponse<FormDefinitionDto>>
{
    private readonly IFormDefinitionRepository _repository;

    public UpdateFormDefinitionCommandHandler(IFormDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<FormDefinitionDto>> Handle(UpdateFormDefinitionCommand request, CancellationToken ct)
    {
        var form = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(FormDefinition), request.Id);

        var schema = new JsonSchema(request.Schema);
        form.Update(request.Title, request.Description, schema, request.Fields, request.Category, request.ModifiedBy);

        await _repository.UpdateAsync(form, ct);

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
