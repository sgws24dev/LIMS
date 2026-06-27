namespace ResearchLms.AiServices.Domain.ValueObjects;

public enum ChatRole
{
    User,
    Assistant,
    System
}

public record ChatMessage(ChatRole Role, string Content);
