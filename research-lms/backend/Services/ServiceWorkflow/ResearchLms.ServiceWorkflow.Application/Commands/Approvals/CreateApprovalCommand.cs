using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.Approvals;

public record CreateApprovalCommand(
    Guid ServiceRequestId,
    int StepOrder,
    string ApproverUserId,
    string? ApproverName,
    string CreatedBy
) : IRequest<ApiResponse<ApprovalDto>>;
