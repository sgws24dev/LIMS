using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Queries.Approvals;

public class GetPendingApprovalsQueryHandler : IRequestHandler<GetPendingApprovalsQuery, ApiResponse<IReadOnlyList<ApprovalDto>>>
{
    private readonly IApprovalRepository _repository;
    private readonly IServiceRequestRepository _requestRepository;

    public GetPendingApprovalsQueryHandler(
        IApprovalRepository repository,
        IServiceRequestRepository requestRepository)
    {
        _repository = repository;
        _requestRepository = requestRepository;
    }

    public async Task<ApiResponse<IReadOnlyList<ApprovalDto>>> Handle(GetPendingApprovalsQuery request, CancellationToken ct)
    {
        var approvals = await _repository.GetPendingForUserAsync(request.UserId, ct);

        var dtos = new List<ApprovalDto>();
        foreach (var a in approvals)
        {
            var sr = await _requestRepository.GetByIdAsync(a.ServiceRequestId, ct);
            dtos.Add(new ApprovalDto(
                a.Id, a.ServiceRequestId, a.StepOrder, a.ApproverUserId,
                a.ApproverName, a.Status.ToString(), a.Comment, a.DecidedAt,
                sr?.Title ?? ""
            ));
        }

        return new ApiResponse<IReadOnlyList<ApprovalDto>>(true, dtos);
    }
}
