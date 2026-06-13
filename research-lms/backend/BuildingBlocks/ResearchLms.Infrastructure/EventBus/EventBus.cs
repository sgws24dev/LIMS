using MassTransit;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Infrastructure.EventBus;

public interface IEventBus
{
    Task PublishAsync<T>(T @event, CancellationToken ct = default) where T : IEvent;
}

public class EventBus : IEventBus
{
    private readonly IPublishEndpoint _publishEndpoint;

    public EventBus(IPublishEndpoint publishEndpoint) => _publishEndpoint = publishEndpoint;

    public async Task PublishAsync<T>(T @event, CancellationToken ct = default) where T : IEvent
    {
        await _publishEndpoint.Publish(@event, ct);
    }
}
