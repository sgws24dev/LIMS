using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Exceptions;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Commands.FormDefinitions;

public class DeleteFormDefinitionCommandHandler : IRequestHandler<DeleteFormDefinitionCommand, ApiResponse<bool>>
{
    private readonly IFormDefinitionRepository _repository;

    public DeleteFormDefinitionCommandHandler(IFormDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<bool>> Handle(DeleteFormDefinitionCommand request, CancellationToken ct)
    {
        var form = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(FormDefinition), request.Id);

        var hasActive = await _repository.HasActiveRequestsAsync(request.Id, ct);
        if (hasActive)
            throw new InvalidOperationException("Cannot delete a form with active requests.");

        await _repository.DeleteAsync(form, ct);

        return new ApiResponse<bool>(true, true, "Form definition deleted.");
    }
}
