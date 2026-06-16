using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MailKit.Net.Smtp;
using MimeKit;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Domain.ValueObjects;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Services;

public class SmtpEmailService : ISmtpEmailService
{
    private readonly SmtpOptions _options;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IOptions<SmtpOptions> options, ILogger<SmtpEmailService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(EmailMessage message, CancellationToken ct = default)
    {
        try
        {
            using var client = new SmtpClient();

            await client.ConnectAsync(_options.Host, _options.Port,
                _options.UseSsl ? MailKit.Security.SecureSocketOptions.StartTls :
                                  MailKit.Security.SecureSocketOptions.Auto, ct);

            if (!string.IsNullOrWhiteSpace(_options.Username))
                await client.AuthenticateAsync(_options.Username, _options.Password, ct);

            var mime = new MimeMessage();

            foreach (var to in message.To)
                mime.To.Add(MailboxAddress.Parse(to));

            mime.From.Add(MailboxAddress.Parse(_options.FromAddress));
            mime.Subject = message.Subject;
            mime.Body = new TextPart("plain") { Text = message.Body };

            await client.SendAsync(mime, ct);
            await client.DisconnectAsync(true, ct);

            _logger.LogInformation("Email sent to {Recipients}: {Subject}",
                string.Join(", ", message.To), message.Subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Recipients}: {Subject}",
                string.Join(", ", message.To), message.Subject);
        }
    }
}

public class SmtpOptions
{
    public const string Section = "Smtp";
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 1025;
    public bool UseSsl { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromAddress { get; set; } = "noreply@researchlms.local";
}
