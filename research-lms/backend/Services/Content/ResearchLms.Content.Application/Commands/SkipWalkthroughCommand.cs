using MediatR;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Content.Domain.Interfaces;

namespace ResearchLms.Content.Application.Commands;

public record SkipWalkthroughCommand(Guid WalkthroughId) : IRequest;

public class SkipWalkthroughCommandHandler : IRequestHandler<SkipWalkthroughCommand>
{
    private readonly IUserWalkthroughProgressRepository _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUser _currentUser;

    public SkipWalkthroughCommandHandler(
        IUserWalkthroughProgressRepository repository,
        ITenantContext tenantContext,
        ICurrentUser currentUser)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUser = currentUser;
    }

    public async Task Handle(SkipWalkthroughCommand request, CancellationToken ct)
    {
        await _repository.MarkSkippedAsync(_tenantContext.TenantId, _currentUser.UserId, request.WalkthroughId, ct);
    }
}