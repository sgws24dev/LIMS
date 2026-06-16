using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Queries.Approvals;

public class GetApprovalsByRequestQueryHandler : IRequestHandler<GetApprovalsByRequestQuery, ApiResponse<IReadOnlyList<ApprovalDto>>>
{
    private readonly IApprovalRepository _repository;
    private readonly IServiceRequestRepository _requestRepository;

    public GetApprovalsByRequestQueryHandler(
        IApprovalRepository repository,
        IServiceRequestRepository requestRepository)
    {
        _repository = repository;
        _requestRepository = requestRepository;
    }

    public async Task<ApiResponse<IReadOnlyList<ApprovalDto>>> Handle(GetApprovalsByRequestQuery request, CancellationToken ct)
    {
        var approvals = await _repository.GetByRequestIdAsync(request.ServiceRequestId, ct);
        var sr = await _requestRepository.GetByIdAsync(request.ServiceRequestId, ct);

        var dtos = approvals.OrderBy(a => a.StepOrder).Select(a => new ApprovalDto(
            a.Id, a.ServiceRequestId, a.StepOrder, a.ApproverUserId,
            a.ApproverName, a.Status.ToString(), a.Comment, a.DecidedAt,
            sr?.Title ?? ""
        )).ToList();

        return new ApiResponse<IReadOnlyList<ApprovalDto>>(true, dtos);
    }
}
