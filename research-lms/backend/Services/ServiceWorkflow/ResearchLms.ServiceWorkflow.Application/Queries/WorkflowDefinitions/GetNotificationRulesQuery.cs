using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;

namespace ResearchLms.ServiceWorkflow.Application.Queries.WorkflowDefinitions;

public record GetNotificationRulesQuery(Guid WorkflowDefinitionId) : IRequest<ApiResponse<IReadOnlyList<NotificationRuleDto>>>;
