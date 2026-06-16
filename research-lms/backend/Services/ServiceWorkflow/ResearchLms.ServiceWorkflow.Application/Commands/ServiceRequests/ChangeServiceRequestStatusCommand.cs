using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.ServiceRequests;

public record ChangeServiceRequestStatusCommand(
    Guid Id,
    string NewStatus,
    string ChangedBy,
    string? Comment
) : IRequest<ApiResponse<ServiceRequestDto>>;
