namespace ResearchLms.Communications.Application.DTOs;

public record SendTestTemplateRequest(
    string? Email,
    string? PhoneNumber,
    string? WebhookUrl
);
