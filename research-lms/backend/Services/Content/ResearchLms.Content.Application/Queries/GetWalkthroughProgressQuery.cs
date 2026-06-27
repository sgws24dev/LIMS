using MediatR;
using ResearchLms.Content.Application.DTOs;
using ResearchLms.Content.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Content.Application.Queries;

public record GetWalkthroughProgressQuery(Guid WalkthroughId) : IRequest<WalkthroughProgressDto?>;

public class GetWalkthroughProgressQueryHandler : IRequestHandler<GetWalkthroughProgressQuery, WalkthroughProgressDto?>
{
    private readonly IUserWalkthroughProgressRepository _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUser _currentUser;

    public GetWalkthroughProgressQueryHandler(
        IUserWalkthroughProgressRepository repository,
        ITenantContext tenantContext,
        ICurrentUser currentUser)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUser = currentUser;
    }

    public async Task<WalkthroughProgressDto?> Handle(GetWalkthroughProgressQuery request, CancellationToken ct)
    {
        var progress = await _repository.GetProgressAsync(
            _tenantContext.TenantId, _currentUser.UserId, request.WalkthroughId, ct);

        if (progress == null) return null;

        return new WalkthroughProgressDto(
            progress.WalkthroughId,
            progress.CurrentStepIndex,
            progress.Status.ToString()
        );
    }
}