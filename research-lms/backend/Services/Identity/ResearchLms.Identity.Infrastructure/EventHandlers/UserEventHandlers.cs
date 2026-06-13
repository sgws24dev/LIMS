using MediatR;
using Microsoft.Extensions.Logging;
using ResearchLms.Infrastructure.EventBus;
using ResearchLms.Shared.Events;

namespace ResearchLms.Identity.Infrastructure.EventHandlers;

public class UserCreatedHandler : INotificationHandler<UserCreatedEvent>
{
    private readonly ILogger<UserCreatedHandler> _logger;
    private readonly IEventBus _eventBus;

    public UserCreatedHandler(ILogger<UserCreatedHandler> logger, IEventBus eventBus)
    {
        _logger = logger;
        _eventBus = eventBus;
    }

    public async Task Handle(UserCreatedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling UserCreatedEvent for {Email}", notification.Email);
        await _eventBus.PublishAsync(notification, cancellationToken);
    }
}

public class UserUpdatedHandler : INotificationHandler<UserUpdatedEvent>
{
    private readonly ILogger<UserUpdatedHandler> _logger;
    private readonly IEventBus _eventBus;

    public UserUpdatedHandler(ILogger<UserUpdatedHandler> logger, IEventBus eventBus)
    {
        _logger = logger;
        _eventBus = eventBus;
    }

    public async Task Handle(UserUpdatedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling UserUpdatedEvent for {Email}", notification.Email);
        await _eventBus.PublishAsync(notification, cancellationToken);
    }
}

public class UserDeletedHandler : INotificationHandler<UserDeletedEvent>
{
    private readonly ILogger<UserDeletedHandler> _logger;
    private readonly IEventBus _eventBus;

    public UserDeletedHandler(ILogger<UserDeletedHandler> logger, IEventBus eventBus)
    {
        _logger = logger;
        _eventBus = eventBus;
    }

    public async Task Handle(UserDeletedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling UserDeletedEvent for {Email}", notification.Email);
        await _eventBus.PublishAsync(notification, cancellationToken);
    }
}
