using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Queries.ServiceRequests;

public record GetRequestStatusHistoryQuery(Guid ServiceRequestId) : IRequest<ApiResponse<IReadOnlyList<RequestStatusHistoryDto>>>;
