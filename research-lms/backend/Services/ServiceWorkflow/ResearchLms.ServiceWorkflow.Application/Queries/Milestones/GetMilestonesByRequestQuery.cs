using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Queries.Milestones;

public record GetMilestonesByRequestQuery(Guid ServiceRequestId) : IRequest<ApiResponse<IReadOnlyList<MilestoneDto>>>;
