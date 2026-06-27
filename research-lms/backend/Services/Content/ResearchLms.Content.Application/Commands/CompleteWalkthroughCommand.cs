using MediatR;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Content.Domain.Interfaces;

namespace ResearchLms.Content.Application.Commands;

public record CompleteWalkthroughCommand(Guid WalkthroughId) : IRequest;

public class CompleteWalkthroughCommandHandler : IRequestHandler<CompleteWalkthroughCommand>
{
    private readonly IUserWalkthroughProgressRepository _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUser _currentUser;

    public CompleteWalkthroughCommandHandler(
        IUserWalkthroughProgressRepository repository,
        ITenantContext tenantContext,
        ICurrentUser currentUser)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUser = currentUser;
    }

    public async Task Handle(CompleteWalkthroughCommand request, CancellationToken ct)
    {
        await _repository.MarkCompletedAsync(_tenantContext.TenantId, _currentUser.UserId, request.WalkthroughId, ct);
    }
}
