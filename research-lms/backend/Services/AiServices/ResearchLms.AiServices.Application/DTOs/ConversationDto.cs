namespace ResearchLms.AiServices.Application.DTOs;

public record ConversationDto(
    Guid Id,
    Guid UserId,
    string Topic,
    string Status,
    DateTime CreatedAt,
    DateTime? ClosedAt,
    List<MessageDto> Messages
);

public record MessageDto(
    Guid Id,
    string Role,
    string Content,
    int? TokensUsed,
    DateTime CreatedAt
);

public record TicketDto(
    Guid Id,
    Guid ConversationId,
    string ConversationSummary,
    string Priority,
    string Category,
    Guid? AssignedToUserId,
    string Status,
    DateTime CreatedAt,
    DateTime? ResolvedAt
);

public record CreateTicketRequest(
    string ConversationSummary,
    string Priority,
    string Category
);

public record StartConversationRequest(
    string Topic
);

public record SendMessageRequest(
    string Content
);

public record HelpdeskMetricsDto(
    int TotalConversations,
    int OpenConversations,
    int TotalTickets,
    int OpenTickets,
    double AvgFirstResponseTimeHours,
    double AvgResolutionTimeHours,
    int TicketsCreatedFromChat,
    Dictionary<string, int> TicketsByStatus,
    Dictionary<string, int> TicketsByPriority
);
