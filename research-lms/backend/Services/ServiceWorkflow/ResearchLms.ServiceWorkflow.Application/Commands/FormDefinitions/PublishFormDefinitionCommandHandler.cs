using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Exceptions;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Commands.FormDefinitions;

public class PublishFormDefinitionCommandHandler : IRequestHandler<PublishFormDefinitionCommand, ApiResponse<FormDefinitionDto>>
{
    private readonly IFormDefinitionRepository _repository;

    public PublishFormDefinitionCommandHandler(IFormDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<FormDefinitionDto>> Handle(PublishFormDefinitionCommand request, CancellationToken ct)
    {
        var form = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(FormDefinition), request.Id);

        form.Publish(request.ModifiedBy);
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
