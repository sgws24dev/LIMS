using MediatR;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Communications.Domain.Entities;
using ResearchLms.Communications.Domain.Interfaces;

namespace ResearchLms.Communications.Application.Commands;

public record UpdateNotificationPreferencesCommand(
    string NotificationType,
    string[] Channels,
    bool IsOptedOut
) : IRequest;

public class UpdateNotificationPreferencesCommandHandler : IRequestHandler<UpdateNotificationPreferencesCommand>
{
    private readonly INotificationPreferenceRepository _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUser _currentUser;

    public UpdateNotificationPreferencesCommandHandler(
        INotificationPreferenceRepository repository,
        ITenantContext tenantContext,
        ICurrentUser currentUser)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUser = currentUser;
    }

    public async Task Handle(UpdateNotificationPreferencesCommand request, CancellationToken ct)
    {
        var existing = await _repository.GetByTypeAsync(_tenantContext.TenantId, _currentUser.UserId, request.NotificationType, ct);

        if (existing is not null)
        {
            existing.UpdateChannels(request.Channels);
            existing.SetOptedOut(request.IsOptedOut);
            await _repository.UpdateAsync(existing, ct);
        }
        else
        {
            var preference = new NotificationPreference(_currentUser.UserId, request.NotificationType, request.Channels, request.IsOptedOut);
            await _repository.AddAsync(preference, ct);
        }
    }
}
