using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Exceptions;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Commands.ServiceRequests;

public class ChangeServiceRequestStatusCommandHandler : IRequestHandler<ChangeServiceRequestStatusCommand, ApiResponse<ServiceRequestDto>>
{
    private readonly IServiceRequestRepository _repository;
    private readonly IFormDefinitionRepository _formRepository;

    public ChangeServiceRequestStatusCommandHandler(
        IServiceRequestRepository repository,
        IFormDefinitionRepository formRepository)
    {
        _repository = repository;
        _formRepository = formRepository;
    }

    public async Task<ApiResponse<ServiceRequestDto>> Handle(ChangeServiceRequestStatusCommand request, CancellationToken ct)
    {
        var sr = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.ServiceRequest), request.Id);

        switch (request.NewStatus.ToLowerInvariant())
        {
            case "submitted":
                sr.Submit(request.ChangedBy);
                break;
            case "pendingapproval":
                sr.SendForApproval(request.ChangedBy);
                break;
            case "inreview":
                sr.SetInReview(request.ChangedBy);
                break;
            case "inprogress":
                sr.SetInProgress(request.ChangedBy);
                break;
            case "completed":
                sr.Complete(request.ChangedBy);
                break;
            case "cancelled":
                sr.Cancel(request.ChangedBy, request.Comment);
                break;
            case "onhold":
                sr.Hold(request.ChangedBy, request.Comment);
                break;
            default:
                throw new ArgumentException($"Invalid status transition: {request.NewStatus}");
        }

        await _repository.UpdateAsync(sr, ct);
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
