using MediatR;
using ResearchLms.ServiceWorkflow.Application.DTOs;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;

namespace ResearchLms.ServiceWorkflow.Application.Commands.WorkflowDefinitions;

public class DeleteNotificationRuleCommandHandler
    : IRequestHandler<DeleteNotificationRuleCommand, ApiResponse<bool>>
{
    private readonly INotificationRuleRepository _repository;

    public DeleteNotificationRuleCommandHandler(INotificationRuleRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<bool>> Handle(
        DeleteNotificationRuleCommand request, CancellationToken ct)
    {
        var rule = await _repository.GetByIdAsync(request.Id, ct);
        if (rule is null)
            return new ApiResponse<bool>(false, false, "Notification rule not found.");

        await _repository.DeleteAsync(rule, ct);

        return new ApiResponse<bool>(true, true);
    }
}
