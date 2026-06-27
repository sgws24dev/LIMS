using MediatR;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Communications.Application.DTOs;
using ResearchLms.Communications.Domain.Interfaces;

namespace ResearchLms.Communications.Application.Queries;

public record GetNotificationsQuery(bool? UnreadOnly, string? Type, int Page = 1, int PageSize = 20) : IRequest<IEnumerable<NotificationDto>>;

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, IEnumerable<NotificationDto>>
{
    private readonly INotificationRepository _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUser _currentUser;

    public GetNotificationsQueryHandler(INotificationRepository repository, ITenantContext tenantContext, ICurrentUser currentUser)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUser = currentUser;
    }

    public async Task<IEnumerable<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken ct)
    {
        var notifications = await _repository.GetUserNotificationsAsync(
            _tenantContext.TenantId,
            _currentUser.UserId,
            request.UnreadOnly,
            request.Type,
            request.Page,
            request.PageSize,
            ct);

        return notifications.Select(n => new NotificationDto(
            n.Id, n.UserId, n.Type, n.Title, n.Body, n.Link, n.IsRead, n.ReadAt, n.CreatedAt));
    }
}
