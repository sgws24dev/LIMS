using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Communications.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly string _host;
    private readonly int _port;
    private readonly string _username;
    private readonly string _password;
    private readonly bool _enableSsl;
    private readonly string _fromAddress;
    private readonly string _fromName;
    private readonly SemaphoreSlim _throttle = new(10, 10);

    public SmtpEmailService(IConfiguration configuration)
    {
        var section = configuration.GetSection("Smtp");
        _host = section["Host"] ?? "localhost";
        _port = int.Parse(section["Port"] ?? "1025");
        _username = section["Username"] ?? string.Empty;
        _password = section["Password"] ?? string.Empty;
        _enableSsl = bool.Parse(section["EnableSsl"] ?? "false");
        _fromAddress = section["FromAddress"] ?? "noreply@researchlms.com";
        _fromName = section["FromName"] ?? "Research LMS";
    }

    public async Task SendAsync(string to, string subject, string body, byte[]? attachment = null, string? attachmentName = null, string? attachmentContentType = null, CancellationToken ct = default)
    {
        await _throttle.WaitAsync(ct);
        try
        {
            using var message = new MailMessage
            {
                From = new MailAddress(_fromAddress, _fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            message.To.Add(to);

            if (attachment is not null && attachmentName is not null)
            {
                var ms = new MemoryStream(attachment);
                message.Attachments.Add(new Attachment(ms, attachmentName, attachmentContentType ?? "application/octet-stream"));
            }

            using var client = new SmtpClient(_host, _port)
            {
                EnableSsl = _enableSsl,
                UseDefaultCredentials = false
            };

            if (!string.IsNullOrEmpty(_username))
                client.Credentials = new NetworkCredential(_username, _password);

            await client.SendMailAsync(message, ct);
        }
        finally
        {
            _throttle.Release();
        }
    }

    public async Task SendBulkAsync(string[] recipients, string subject, string body, byte[]? attachment = null, string? attachmentName = null, string? attachmentContentType = null, CancellationToken ct = default)
    {
        var tasks = recipients.Select(r => SendAsync(r, subject, body, attachment, attachmentName, attachmentContentType, ct));
        await Task.WhenAll(tasks);
    }
}
