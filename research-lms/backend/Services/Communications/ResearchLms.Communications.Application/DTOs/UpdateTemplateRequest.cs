namespace ResearchLms.Communications.Application.DTOs;

public record UpdateTemplateRequest(
    string Name,
    string Channel,
    string Subject,
    string Body,
    bool IsDefault
);
