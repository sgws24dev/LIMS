using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Queries.ServiceRequests;

public class GetServiceRequestsQueryHandler : IRequestHandler<GetServiceRequestsQuery, ApiResponse<IReadOnlyList<ServiceRequestDto>>>
{
    private readonly IServiceRequestRepository _repository;
    private readonly IFormDefinitionRepository _formRepository;

    public GetServiceRequestsQueryHandler(
        IServiceRequestRepository repository,
        IFormDefinitionRepository formRepository)
    {
        _repository = repository;
        _formRepository = formRepository;
    }

    public async Task<ApiResponse<IReadOnlyList<ServiceRequestDto>>> Handle(GetServiceRequestsQuery request, CancellationToken ct)
    {
        IReadOnlyList<Domain.Entities.ServiceRequest> requests;

        if (request.FormDefinitionId.HasValue)
            requests = await _repository.GetByFormDefinitionIdAsync(request.FormDefinitionId.Value, ct);
        else if (!string.IsNullOrWhiteSpace(request.AssignedTo))
            requests = await _repository.GetByAssigneeAsync(request.AssignedTo, ct);
        else if (!string.IsNullOrWhiteSpace(request.CreatedBy))
            requests = await _repository.GetBySubmitterAsync(request.CreatedBy, ct);
        else
            requests = await _repository.GetAllAsync(request.TenantId, ct);

        if (!string.IsNullOrWhiteSpace(request.Status))
            requests = requests.Where(r =>
                r.Status.ToString().Equals(request.Status, StringComparison.OrdinalIgnoreCase)).ToList();

        var forms = new Dictionary<Guid, string>();
        var dtos = new List<ServiceRequestDto>();
        foreach (var sr in requests)
        {
            if (!forms.ContainsKey(sr.FormDefinitionId))
            {
                var form = await _formRepository.GetByIdAsync(sr.FormDefinitionId, ct);
                forms[sr.FormDefinitionId] = form?.Title ?? "";
            }

            dtos.Add(new ServiceRequestDto(
                sr.Id, sr.FormDefinitionId, sr.FormDefinitionVersion, forms[sr.FormDefinitionId],
                sr.Title, sr.Description, sr.Status.ToString(), sr.FormData,
                sr.AssignedTo, sr.SubmittedAt, sr.SubmittedBy, sr.CompletedAt, sr.CompletedBy,
                sr.ApprovalRouting.ToString(), sr.CreatedAt, sr.CreatedBy
            ));
        }

        return new ApiResponse<IReadOnlyList<ServiceRequestDto>>(true, dtos);
    }
}
