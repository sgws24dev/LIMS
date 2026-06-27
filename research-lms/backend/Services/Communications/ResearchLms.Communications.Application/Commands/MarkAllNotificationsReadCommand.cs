using MediatR;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Communications.Domain.Interfaces;

namespace ResearchLms.Communications.Application.Commands;

public record MarkAllNotificationsReadCommand : IRequest;

public class MarkAllNotificationsReadCommandHandler : IRequestHandler<MarkAllNotificationsReadCommand>
{
    private readonly INotificationRepository _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUser _currentUser;

    public MarkAllNotificationsReadCommandHandler(
        INotificationRepository repository,
        ITenantContext tenantContext,
        ICurrentUser currentUser)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUser = currentUser;
    }

    public async Task Handle(MarkAllNotificationsReadCommand request, CancellationToken ct)
    {
        await _repository.MarkAllAsReadAsync(_tenantContext.TenantId, _currentUser.UserId, ct);
    }
}
