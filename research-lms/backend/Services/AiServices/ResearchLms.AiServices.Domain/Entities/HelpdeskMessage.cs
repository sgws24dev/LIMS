using ResearchLms.AiServices.Domain.ValueObjects;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Domain.Entities;

public class HelpdeskMessage : BaseEntity
{
    public Guid ConversationId { get; private set; }
    public ChatRole Role { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public int? TokensUsed { get; private set; }

    protected HelpdeskMessage() { }

    public HelpdeskMessage(Guid conversationId, ChatRole role, string content, int? tokensUsed = null)
    {
        ConversationId = conversationId;
        Role = role;
        Content = content;
        TokensUsed = tokensUsed;
    }
}
