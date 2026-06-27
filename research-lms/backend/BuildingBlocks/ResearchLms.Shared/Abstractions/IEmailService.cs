namespace ResearchLms.Shared.Abstractions;

public interface IEmailService
{
    Task SendAsync(string to, string subject, string body, byte[]? attachment = null, string? attachmentName = null, string? attachmentContentType = null, CancellationToken ct = default);
    Task SendBulkAsync(string[] recipients, string subject, string body, byte[]? attachment = null, string? attachmentName = null, string? attachmentContentType = null, CancellationToken ct = default);
}
