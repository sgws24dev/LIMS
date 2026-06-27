using MediatR;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Communications.Application.DTOs;
using ResearchLms.Communications.Domain.Interfaces;

namespace ResearchLms.Communications.Application.Queries;

public record GetNotificationPreferencesQuery : IRequest<IReadOnlyList<NotificationPreferenceDto>>;

public class GetNotificationPreferencesQueryHandler : IRequestHandler<GetNotificationPreferencesQuery, IReadOnlyList<NotificationPreferenceDto>>
{
    private readonly INotificationPreferenceRepository _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUser _currentUser;

    public GetNotificationPreferencesQueryHandler(INotificationPreferenceRepository repository, ITenantContext tenantContext, ICurrentUser currentUser)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<NotificationPreferenceDto>> Handle(GetNotificationPreferencesQuery request, CancellationToken ct)
    {
        var preferences = await _repository.GetUserPreferencesAsync(_tenantContext.TenantId, _currentUser.UserId, ct);

        return preferences.Select(p => new NotificationPreferenceDto(
            p.Id, p.NotificationType, p.GetChannels(), p.IsOptedOut)).ToList();
    }
}
