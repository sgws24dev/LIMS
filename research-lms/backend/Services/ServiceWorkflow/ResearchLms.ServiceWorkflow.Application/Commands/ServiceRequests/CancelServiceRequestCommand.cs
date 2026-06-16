using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.ServiceRequests;

public record CancelServiceRequestCommand(
    Guid Id,
    string CancelledBy,
    string? Comment
) : IRequest<ApiResponse<ServiceRequestDto>>;
