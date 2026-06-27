using MassTransit;
using Microsoft.Extensions.Logging;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Communications.Infrastructure.Consumers;

public class SendNotificationConsumer : IConsumer<NotificationMessage>
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<SendNotificationConsumer> _logger;

    public SendNotificationConsumer(INotificationService notificationService, ILogger<SendNotificationConsumer> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<NotificationMessage> context)
    {
        _logger.LogInformation("Consuming SendNotification for user {UserId} type {Type}", context.Message.UserId, context.Message.Type);
        await _notificationService.SendAsync(context.Message, context.CancellationToken);
    }
}
