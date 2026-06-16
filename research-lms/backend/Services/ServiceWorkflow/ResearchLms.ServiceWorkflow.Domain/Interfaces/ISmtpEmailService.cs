namespace ResearchLms.ServiceWorkflow.Domain.Interfaces;

public interface ISmtpEmailService
{
    Task SendAsync(EmailMessage message, CancellationToken ct = default);
}

public record EmailMessage(
    IEnumerable<string> To,
    string Subject,
    string Body,
    bool IsHtml = false,
    IEnumerable<string>? Cc = null
);
