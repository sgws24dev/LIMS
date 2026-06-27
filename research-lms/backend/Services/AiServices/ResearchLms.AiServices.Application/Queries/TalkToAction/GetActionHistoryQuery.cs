using MediatR;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Queries.TalkToAction;

public record GetActionHistoryQuery : IRequest<List<ActionLogEntryDto>>;

public class GetActionHistoryHandler : IRequestHandler<GetActionHistoryQuery, List<ActionLogEntryDto>>
{
    private readonly IActionLogRepository _repository;
    private readonly ITenantContext _tenant;
    private readonly ICurrentUser _currentUser;

    public GetActionHistoryHandler(IActionLogRepository repository, ITenantContext tenant, ICurrentUser currentUser)
    {
        _repository = repository;
        _tenant = tenant;
        _currentUser = currentUser;
    }

    public async Task<List<ActionLogEntryDto>> Handle(GetActionHistoryQuery request, CancellationToken ct)
    {
        var logs = await _repository.GetByTenantAsync(_tenant.TenantId, _currentUser.UserId, ct);
        return logs.Select(l => new ActionLogEntryDto(
            l.Id, l.UserId, l.Utterance, l.Intent, l.Status,
            l.GuardrailResultJson, l.ExecutionResultJson, l.DurationMs, l.CreatedAt
        )).ToList();
    }
}
