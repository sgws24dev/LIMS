using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Exceptions;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Commands.ServiceRequests;

public class SubmitServiceRequestCommandHandler : IRequestHandler<SubmitServiceRequestCommand, ApiResponse<ServiceRequestDto>>
{
    private readonly IServiceRequestRepository _repository;
    private readonly IFormDefinitionRepository _formRepository;
    private readonly IWorkflowDefinitionRepository _workflowDefinitionRepository;
    private readonly IWorkflowExecutionService _workflowExecutionService;

    public SubmitServiceRequestCommandHandler(
        IServiceRequestRepository repository,
        IFormDefinitionRepository formRepository,
        IWorkflowDefinitionRepository workflowDefinitionRepository,
        IWorkflowExecutionService workflowExecutionService)
    {
        _repository = repository;
        _formRepository = formRepository;
        _workflowDefinitionRepository = workflowDefinitionRepository;
        _workflowExecutionService = workflowExecutionService;
    }

    public async Task<ApiResponse<ServiceRequestDto>> Handle(SubmitServiceRequestCommand request, CancellationToken ct)
    {
        var sr = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.ServiceRequest), request.Id);

        sr.Submit(request.SubmittedBy);
        await _repository.UpdateAsync(sr, ct);

        // Auto-start workflow if a published definition exists
        var definitions = await _workflowDefinitionRepository.GetPublishedByEntityHintAsync("ServiceRequest", ct);
        var definition = definitions.FirstOrDefault();
        if (definition is not null)
        {
            var context = new Dictionary<string, object>
            {
                ["UserId"] = request.SubmittedBy,
                ["RequestTitle"] = sr.Title,
                ["RequestId"] = sr.Id.ToString(),
                ["FormData"] = sr.FormData
            };

            await _workflowExecutionService.StartInstanceAsync(
                definition.Id,
                "ServiceRequest",
                sr.Id,
                context,
                ct);
        }

        var form = await _formRepository.GetByIdAsync(sr.FormDefinitionId, ct);

        return new ApiResponse<ServiceRequestDto>(true, new ServiceRequestDto(
            sr.Id, sr.FormDefinitionId, sr.FormDefinitionVersion, form?.Title ?? "",
            sr.Title, sr.Description, sr.Status.ToString(), sr.Priority.ToString(),
            sr.FormData, sr.AssignedTo, sr.SubmittedAt, sr.SubmittedBy,
            sr.DueDate, sr.CompletedAt, sr.CompletedBy,
            sr.ApprovalRouting.ToString(), sr.CreatedAt, sr.CreatedBy
        ));
    }
}
