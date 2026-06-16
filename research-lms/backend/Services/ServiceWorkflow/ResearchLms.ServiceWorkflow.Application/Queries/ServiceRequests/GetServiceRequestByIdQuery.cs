using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Queries.ServiceRequests;

public record GetServiceRequestByIdQuery(Guid Id) : IRequest<ApiResponse<ServiceRequestDto>>;
