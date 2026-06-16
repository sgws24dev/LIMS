using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Commands.WorkflowDefinitions;

public record AddNotificationRuleCommand(
    Guid WorkflowDefinitionId,
    string Trigger,
    string Channel,
    string Subject,
    string Body,
    string Recipients,
    string CreatedBy
) : IRequest<ApiResponse<NotificationRuleDto>>;
