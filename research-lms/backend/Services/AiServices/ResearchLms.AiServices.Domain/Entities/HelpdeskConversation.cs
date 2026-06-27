using ResearchLms.AiServices.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Domain.Entities;

public class HelpdeskConversation : BaseEntity
{
    public Guid UserId { get; private set; }
    public string Topic { get; private set; } = string.Empty;
    public ConversationStatus Status { get; private set; }
    public DateTime? ClosedAt { get; private set; }

    private readonly List<HelpdeskMessage> _messages = new();
    public IReadOnlyCollection<HelpdeskMessage> Messages => _messages.AsReadOnly();

    protected HelpdeskConversation() { }

    public HelpdeskConversation(Guid userId, string topic)
    {
        UserId = userId;
        Topic = topic;
        Status = ConversationStatus.Open;
    }

    public void AddMessage(HelpdeskMessage message) => _messages.Add(message);

    public void Close()
    {
        Status = ConversationStatus.Closed;
        ClosedAt = DateTime.UtcNow;
    }

    public void MarkPendingTicket()
    {
        Status = ConversationStatus.PendingTicket;
    }
}
