namespace ResearchLms.Shared.Abstractions;

public interface IEvent
{
    Guid EventId { get; }
    DateTime OccurredOn { get; }
}
