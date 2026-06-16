using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Queries.ServiceRequests;

public record GetServiceRequestsQuery(
    Guid TenantId,
    Guid? FormDefinitionId = null,
    string? Status = null,
    string? AssignedTo = null,
    string? CreatedBy = null
) : IRequest<ApiResponse<IReadOnlyList<ServiceRequestDto>>>;
