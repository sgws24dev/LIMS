using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Exceptions;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Commands.Approvals;

public class CreateApprovalCommandHandler : IRequestHandler<CreateApprovalCommand, ApiResponse<ApprovalDto>>
{
    private readonly IApprovalRepository _repository;
    private readonly IServiceRequestRepository _requestRepository;

    public CreateApprovalCommandHandler(IApprovalRepository repository, IServiceRequestRepository requestRepository)
    {
        _repository = repository;
        _requestRepository = requestRepository;
    }

    public async Task<ApiResponse<ApprovalDto>> Handle(CreateApprovalCommand request, CancellationToken ct)
    {
        var sr = await _requestRepository.GetByIdAsync(request.ServiceRequestId, ct)
            ?? throw new NotFoundException(nameof(ServiceRequest), request.ServiceRequestId);

        var approval = new Approval(
            request.ServiceRequestId,
            request.StepOrder,
            request.ApproverUserId,
            request.ApproverName);

        await _repository.AddAsync(approval, ct);

        return new ApiResponse<ApprovalDto>(true, new ApprovalDto(
            approval.Id,
            approval.ServiceRequestId,
            approval.StepOrder,
            approval.ApproverUserId,
            approval.ApproverName,
            approval.Status.ToString(),
            approval.Comment,
            approval.DecidedAt,
            sr.Title
        ));
    }
}
