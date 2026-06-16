using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.ServiceRequests;

public record CreateServiceRequestCommand(
    Guid FormDefinitionId,
    string Title,
    string? Description,
    string FormData,
    string ApprovalRouting,
    string CreatedBy
) : IRequest<ApiResponse<ServiceRequestDto>>;
