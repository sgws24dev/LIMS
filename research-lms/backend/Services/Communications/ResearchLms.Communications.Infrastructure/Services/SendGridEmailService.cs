using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Communications.Infrastructure.Services;

public class SendGridEmailService : IEmailService
{
    private readonly string _apiKey;
    private readonly string _fromAddress;
    private readonly string _fromName;
    private readonly HttpClient _httpClient;

    public SendGridEmailService(IConfiguration configuration, HttpClient httpClient)
    {
        _apiKey = configuration["SendGrid:ApiKey"] ?? string.Empty;
        _fromAddress = configuration["SendGrid:FromAddress"] ?? "noreply@researchlms.com";
        _fromName = configuration["SendGrid:FromName"] ?? "Research LMS";
        _httpClient = httpClient;
    }

    public async Task SendAsync(string to, string subject, string body, byte[]? attachment = null, string? attachmentName = null, string? attachmentContentType = null, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(_apiKey))
            throw new InvalidOperationException("SendGrid API key is not configured.");

        var payload = new
        {
            personalizations = new[] {
                new { to = new[] { new { email = to } } }
            },
            from = new { email = _fromAddress, name = _fromName },
            subject,
            content = new[] {
                new { type = "text/html", value = body }
            }
        };

        var json = JsonSerializer.Serialize(payload);
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.sendgrid.com/v3/mail/send")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var response = await _httpClient.SendAsync(request, ct);
        response.EnsureSuccessStatusCode();
    }

    public async Task SendBulkAsync(string[] recipients, string subject, string body, byte[]? attachment = null, string? attachmentName = null, string? attachmentContentType = null, CancellationToken ct = default)
    {
        var tasks = recipients.Select(r => SendAsync(r, subject, body, attachment, attachmentName, attachmentContentType, ct));
        await Task.WhenAll(tasks);
    }
}
