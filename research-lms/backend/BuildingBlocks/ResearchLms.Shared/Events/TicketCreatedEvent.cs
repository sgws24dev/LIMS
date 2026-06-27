namespace ResearchLms.Shared.Events;

public record TicketCreatedEvent(
    Guid TicketId,
    Guid ConversationId,
    Guid TenantId,
    Guid CreatedByUserId,
    string Summary,
    string Priority,
    string Category,
    DateTime OccurredOn
) : BaseEvent;
