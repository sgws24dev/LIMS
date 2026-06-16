using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.ServiceRequests;

public record SubmitServiceRequestCommand(
    Guid Id,
    string SubmittedBy,
    string? Comment
) : IRequest<ApiResponse<ServiceRequestDto>>;
