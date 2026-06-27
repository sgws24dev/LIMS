using ResearchLms.AiServices.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Domain.Entities;

public class HelpdeskTicket : BaseEntity
{
    public Guid ConversationId { get; private set; }
    public string ConversationSummary { get; private set; } = string.Empty;
    public TicketPriority Priority { get; private set; }
    public string Category { get; private set; } = string.Empty;
    public Guid? AssignedToUserId { get; private set; }
    public TicketStatus Status { get; private set; }
    public DateTime? ResolvedAt { get; private set; }

    protected HelpdeskTicket() { }

    public HelpdeskTicket(Guid conversationId, string conversationSummary, TicketPriority priority, string category)
    {
        ConversationId = conversationId;
        ConversationSummary = conversationSummary;
        Priority = priority;
        Category = category;
        Status = TicketStatus.New;
    }

    public void Assign(Guid userId)
    {
        AssignedToUserId = userId;
        Status = TicketStatus.Assigned;
    }

    public void MarkInProgress() => Status = TicketStatus.InProgress;

    public void Resolve()
    {
        Status = TicketStatus.Resolved;
        ResolvedAt = DateTime.UtcNow;
    }

    public void Close() => Status = TicketStatus.Closed;
}
