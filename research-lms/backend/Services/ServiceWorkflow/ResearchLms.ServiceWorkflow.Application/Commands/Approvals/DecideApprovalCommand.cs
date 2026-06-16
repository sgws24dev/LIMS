using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.Approvals;

public record DecideApprovalCommand(
    Guid Id,
    bool Approved,
    string? Comment,
    string DecidedBy
) : IRequest<ApiResponse<ApprovalDto>>;
