using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Queries.ServiceRequests;

public class GetRequestStatusHistoryQueryHandler
    : IRequestHandler<GetRequestStatusHistoryQuery, ApiResponse<IReadOnlyList<RequestStatusHistoryDto>>>
{
    private readonly IServiceRequestRepository _repository;

    public GetRequestStatusHistoryQueryHandler(IServiceRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<IReadOnlyList<RequestStatusHistoryDto>>> Handle(
        GetRequestStatusHistoryQuery request, CancellationToken ct)
    {
        var sr = await _repository.GetByIdAsync(request.ServiceRequestId, ct);
        if (sr == null)
            return new ApiResponse<IReadOnlyList<RequestStatusHistoryDto>>(true, Array.Empty<RequestStatusHistoryDto>());

        var dtos = sr.StatusHistory.OrderBy(h => h.CreatedAt).Select(h => new RequestStatusHistoryDto(
            h.Id, h.ServiceRequestId, h.FromStatus.ToString(), h.ToStatus.ToString(),
            h.Comment, h.ChangedBy, h.CreatedAt
        )).ToList();

        return new ApiResponse<IReadOnlyList<RequestStatusHistoryDto>>(true, dtos);
    }
}
