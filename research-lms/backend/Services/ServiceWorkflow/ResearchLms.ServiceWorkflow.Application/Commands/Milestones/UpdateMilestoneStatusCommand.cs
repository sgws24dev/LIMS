using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.Milestones;

public record UpdateMilestoneStatusCommand(
    Guid Id,
    string Action,
    string ModifiedBy
) : IRequest<ApiResponse<MilestoneDto>>;
