using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Enums;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Commands.WorkflowDefinitions;

public class AddNotificationRuleCommandHandler
    : IRequestHandler<AddNotificationRuleCommand, ApiResponse<NotificationRuleDto>>
{
    private readonly INotificationRuleRepository _ruleRepository;

    public AddNotificationRuleCommandHandler(INotificationRuleRepository ruleRepository)
    {
        _ruleRepository = ruleRepository;
    }

    public async Task<ApiResponse<NotificationRuleDto>> Handle(
        AddNotificationRuleCommand request, CancellationToken ct)
    {
        if (!Enum.TryParse<NotificationChannel>(request.Channel, true, out var channel))
            return new ApiResponse<NotificationRuleDto>(false, null, "Invalid notification channel.");

        var rule = new NotificationRule(
            request.WorkflowDefinitionId,
            request.Trigger,
            channel,
            request.Subject,
            request.Body,
            request.Recipients,
            request.CreatedBy);

        await _ruleRepository.AddAsync(rule, ct);

        return new ApiResponse<NotificationRuleDto>(true, new NotificationRuleDto(
            rule.Id, rule.WorkflowDefinitionId, rule.Trigger,
            rule.Channel.ToString(), rule.Subject, rule.Body,
            rule.Recipients, rule.IsActive));
    }
}
