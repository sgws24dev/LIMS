using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Queries.WorkflowDefinitions;

public class GetNotificationRulesQueryHandler
    : IRequestHandler<GetNotificationRulesQuery, ApiResponse<IReadOnlyList<NotificationRuleDto>>>
{
    private readonly INotificationRuleRepository _repository;

    public GetNotificationRulesQueryHandler(INotificationRuleRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<IReadOnlyList<NotificationRuleDto>>> Handle(
        GetNotificationRulesQuery request, CancellationToken ct)
    {
        var rules = await _repository.GetByDefinitionIdAsync(request.WorkflowDefinitionId, ct);

        var dtos = rules.Select(r => new NotificationRuleDto(
            r.Id, r.WorkflowDefinitionId, r.Trigger,
            r.Channel.ToString(), r.Subject, r.Body,
            r.Recipients, r.IsActive))
            .ToList();

        return new ApiResponse<IReadOnlyList<NotificationRuleDto>>(true, dtos);
    }
}
