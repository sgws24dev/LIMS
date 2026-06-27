using MediatR;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Content.Domain.Interfaces;

namespace ResearchLms.Content.Application.Commands;

public record SaveWalkthroughProgressCommand(Guid WalkthroughId, int CurrentStepIndex) : IRequest;

public class SaveWalkthroughProgressCommandHandler : IRequestHandler<SaveWalkthroughProgressCommand>
{
    private readonly IUserWalkthroughProgressRepository _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUser _currentUser;

    public SaveWalkthroughProgressCommandHandler(
        IUserWalkthroughProgressRepository repository,
        ITenantContext tenantContext,
        ICurrentUser currentUser)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUser = currentUser;
    }

    public async Task Handle(SaveWalkthroughProgressCommand request, CancellationToken ct)
    {
        await _repository.SaveProgressAsync(_tenantContext.TenantId, _currentUser.UserId, request.WalkthroughId, request.CurrentStepIndex, ct);
    }
}