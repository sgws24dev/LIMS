using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Exceptions;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ApprovalDecisionEnum = ResearchLms.ServiceWorkflow.Domain.Interfaces.ApprovalDecision;

namespace ResearchLms.ServiceWorkflow.Application.Commands.Approvals;

public class DecideApprovalCommandHandler : IRequestHandler<DecideApprovalCommand, ApiResponse<ApprovalDto>>
{
    private readonly IApprovalRepository _repository;
    private readonly IServiceRequestRepository _requestRepository;
    private readonly IApprovalEngine _approvalEngine;

    public DecideApprovalCommandHandler(
        IApprovalRepository repository,
        IServiceRequestRepository requestRepository,
        IApprovalEngine approvalEngine)
    {
        _repository = repository;
        _requestRepository = requestRepository;
        _approvalEngine = approvalEngine;
    }

    public async Task<ApiResponse<ApprovalDto>> Handle(DecideApprovalCommand request, CancellationToken ct)
    {
        var approval = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Approval), request.Id);

        if (request.Approved)
            approval.Approve(request.DecidedBy, request.Comment);
        else
            approval.Reject(request.DecidedBy, request.Comment);

        await _repository.UpdateAsync(approval, ct);

        var sr = await _requestRepository.GetByIdAsync(approval.ServiceRequestId, ct);
        if (sr != null)
        {
            var allApprovals = await _repository.GetByRequestIdAsync(sr.Id, ct);
            var decision = await _approvalEngine.EvaluateAsync(sr, ct);

            if (decision == ApprovalDecisionEnum.Approved)
                sr.Approve("system");
            else if (decision == ApprovalDecisionEnum.Rejected)
                sr.Reject("system", "Required approval was rejected.");

            await _requestRepository.UpdateAsync(sr, ct);
        }

        return new ApiResponse<ApprovalDto>(true, new ApprovalDto(
            approval.Id,
            approval.ServiceRequestId,
            approval.StepOrder,
            approval.ApproverUserId,
            approval.ApproverName,
            approval.Status.ToString(),
            approval.Comment,
            approval.DecidedAt,
            sr?.Title ?? ""
        ));
    }
}
