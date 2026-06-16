using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Queries.Approvals;

public record GetApprovalsByRequestQuery(Guid ServiceRequestId) : IRequest<ApiResponse<IReadOnlyList<ApprovalDto>>>;
