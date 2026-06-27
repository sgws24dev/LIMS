using MassTransit;
using Microsoft.Extensions.Logging;
using ResearchLms.Communications.Domain.Interfaces;

namespace ResearchLms.Communications.Infrastructure.Consumers;

public class UserCreatedEvent
{
    public Guid EventId { get; set; }
    public DateTime OccurredOn { get; set; }
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
}

public class UserCreatedConsumer : IConsumer<UserCreatedEvent>
{
    private readonly INotificationPreferenceRepository _preferenceRepo;
    private readonly ILogger<UserCreatedConsumer> _logger;

    public UserCreatedConsumer(INotificationPreferenceRepository preferenceRepo, ILogger<UserCreatedConsumer> logger)
    {
        _preferenceRepo = preferenceRepo;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<UserCreatedEvent> context)
    {
        _logger.LogInformation("Seeding notification preferences for user {UserId}", context.Message.UserId);
        await _preferenceRepo.SeedDefaultsAsync(context.Message.TenantId, context.Message.UserId, context.CancellationToken);
    }
}
