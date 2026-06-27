using Microsoft.Extensions.Logging;
using ResearchLms.Communications.Domain.Entities;
using ResearchLms.Communications.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Communications.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace ResearchLms.Communications.Infrastructure.Services;

public class NotificationDispatcher : INotificationService
{
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly ITeamsNotificationService _teamsService;
    private readonly INotificationRepository _notificationRepo;
    private readonly IHubContext<NotificationsHub> _hubContext;
    private readonly ILogger<NotificationDispatcher> _logger;

    public NotificationDispatcher(
        IEmailService emailService,
        ISmsService smsService,
        ITeamsNotificationService teamsService,
        INotificationRepository notificationRepo,
        IHubContext<NotificationsHub> hubContext,
        ILogger<NotificationDispatcher> logger)
    {
        _emailService = emailService;
        _smsService = smsService;
        _teamsService = teamsService;
        _notificationRepo = notificationRepo;
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task SendAsync(NotificationMessage notification, CancellationToken ct = default)
    {
        await SendToChannels(notification, ct);

        // Always store in-app notification
        var inApp = new Notification(
            notification.UserId,
            notification.Type,
            notification.Title,
            notification.Body,
            notification.Link);
        inApp.SetTenant(notification.TenantId);
        await _notificationRepo.AddAsync(inApp, ct);

        // Push via SignalR
        try
        {
            await _hubContext.Clients.User(notification.UserId.ToString())
                .SendAsync("ReceiveNotification", new
                {
                    id = inApp.Id,
                    type = notification.Type,
                    title = notification.Title,
                    body = notification.Body,
                    link = notification.Link,
                    isRead = false,
                    createdAt = inApp.CreatedAt
                }, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to push SignalR notification to user {UserId}", notification.UserId);
        }
    }

    public async Task SendBulkAsync(IEnumerable<NotificationMessage> notifications, CancellationToken ct = default)
    {
        var tasks = notifications.Select(n => SendAsync(n, ct));
        await Task.WhenAll(tasks);
    }

    private async Task SendToChannels(NotificationMessage notification, CancellationToken ct)
    {
        var tasks = new List<Task>();

        foreach (var channel in notification.Channels)
        {
            switch (channel.ToLowerInvariant())
            {
                case "email" when !string.IsNullOrEmpty(notification.EmailTo):
                    tasks.Add(_emailService.SendAsync(
                        notification.EmailTo,
                        notification.EmailSubject ?? notification.Title,
                        notification.Body,
                        notification.Attachment,
                        notification.AttachmentName,
                        notification.AttachmentContentType,
                        ct));
                    break;

                case "sms" when !string.IsNullOrEmpty(notification.SmsTo):
                    tasks.Add(_smsService.SendAsync(notification.SmsTo, notification.Body, ct));
                    break;

                case "teams" when !string.IsNullOrEmpty(notification.TeamsWebhookUrl):
                    tasks.Add(_teamsService.SendAsync(notification.TeamsWebhookUrl, notification.Title, notification.Body, ct: ct));
                    break;
            }
        }

        await Task.WhenAll(tasks);
    }
}
