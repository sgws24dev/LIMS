using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Queries.Approvals;

public record GetPendingApprovalsQuery(string UserId) : IRequest<ApiResponse<IReadOnlyList<ApprovalDto>>>;
