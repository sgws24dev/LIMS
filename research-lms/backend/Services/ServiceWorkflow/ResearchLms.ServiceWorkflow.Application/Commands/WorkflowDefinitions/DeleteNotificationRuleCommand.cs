using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.WorkflowDefinitions;

public record DeleteNotificationRuleCommand(Guid Id) : IRequest<ApiResponse<bool>>;
