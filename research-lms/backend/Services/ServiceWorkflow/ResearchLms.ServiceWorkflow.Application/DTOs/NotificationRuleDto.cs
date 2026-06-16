namespace ResearchLms.ServiceWorkflow.Application.DTOs;

public record NotificationRuleDto(
    Guid Id,
    Guid WorkflowDefinitionId,
    string Trigger,
    string Channel,
    string Subject,
    string Body,
    string Recipients,
    bool IsActive);
