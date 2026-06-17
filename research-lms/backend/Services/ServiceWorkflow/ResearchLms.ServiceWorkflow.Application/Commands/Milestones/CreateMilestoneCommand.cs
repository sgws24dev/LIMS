using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.Milestones;

public record CreateMilestoneCommand(
    Guid ServiceRequestId,
    string Title,
    string? Description,
    int Order,
    DateTime? DueDate,
    string? AssignedTo,
    string CreatedBy
) : IRequest<ApiResponse<MilestoneDto>>;
