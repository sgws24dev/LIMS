using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Shared.Events;

public abstract record BaseEvent : IEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
