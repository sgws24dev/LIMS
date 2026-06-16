using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.ServiceRequests;

public record AssignServiceRequestCommand(
    Guid Id,
    string AssignedTo,
    string AssignedBy
) : IRequest<ApiResponse<ServiceRequestDto>>;
