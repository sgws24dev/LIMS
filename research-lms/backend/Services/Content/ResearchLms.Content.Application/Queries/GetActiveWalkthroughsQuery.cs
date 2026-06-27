using MediatR;
using ResearchLms.Content.Application.DTOs;
using ResearchLms.Content.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Content.Application.Queries;

public record GetActiveWalkthroughsQuery(string Route) : IRequest<List<WalkthroughDto>>;

public class GetActiveWalkthroughsQueryHandler : IRequestHandler<GetActiveWalkthroughsQuery, List<WalkthroughDto>>
{
    private readonly IWalkthroughRepository _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUser _currentUser;
    private readonly IUserWalkthroughProgressRepository _progressRepository;

    public GetActiveWalkthroughsQueryHandler(
        IWalkthroughRepository repository,
        ITenantContext tenantContext,
        ICurrentUser currentUser,
        IUserWalkthroughProgressRepository progressRepository)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUser = currentUser;
        _progressRepository = progressRepository;
    }

    public async Task<List<WalkthroughDto>> Handle(GetActiveWalkthroughsQuery request, CancellationToken ct)
    {
        var completedIds = await _progressRepository
            .GetCompletedWalkthroughIdsAsync(_tenantContext.TenantId, _currentUser.UserId, ct);

        var walkthroughs = await _repository
            .GetActiveByRouteAsync(_tenantContext.TenantId, request.Route, ct);

        return walkthroughs
            .Where(w => !completedIds.Contains(w.Id))
            .Select(w => new WalkthroughDto(
                w.Id, w.Name, w.TargetRoute, w.Trigger.ToString(),
                w.Priority, w.IsActive,
                w.Steps.OrderBy(s => s.StepOrder).Select(s => new WalkthroughStepDto(
                    s.Id, s.StepOrder, s.Title, s.Content,
                    s.ElementSelector, s.Placement.ToString(), s.ActionType.ToString()
                )).ToList()
            ))
            .OrderBy(w => w.Priority)
            .ToList();
    }
}
