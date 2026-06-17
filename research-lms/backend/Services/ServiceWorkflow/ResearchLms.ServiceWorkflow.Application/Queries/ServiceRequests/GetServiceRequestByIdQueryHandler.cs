using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Exceptions;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Queries.ServiceRequests;

public class GetServiceRequestByIdQueryHandler : IRequestHandler<GetServiceRequestByIdQuery, ApiResponse<ServiceRequestDto>>
{
    private readonly IServiceRequestRepository _repository;
    private readonly IFormDefinitionRepository _formRepository;

    public GetServiceRequestByIdQueryHandler(
        IServiceRequestRepository repository,
        IFormDefinitionRepository formRepository)
    {
        _repository = repository;
        _formRepository = formRepository;
    }

    public async Task<ApiResponse<ServiceRequestDto>> Handle(GetServiceRequestByIdQuery request, CancellationToken ct)
    {
        var sr = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.ServiceRequest), request.Id);

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
