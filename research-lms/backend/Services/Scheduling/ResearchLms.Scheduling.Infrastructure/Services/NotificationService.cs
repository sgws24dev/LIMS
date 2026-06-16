using Microsoft.Extensions.Logging;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(ILogger<NotificationService> logger) => _logger = logger;

    public Task SendWaitlistPromotionAsync(WaitlistEntry entry)
    {
        _logger.LogInformation(
            "Waitlist promotion sent to user {UserId} for resource {ResourceId}, booking {BookingId}",
            entry.UserId, entry.ResourceId, entry.ProvisionalBookingId);
        return Task.CompletedTask;
    }
}
