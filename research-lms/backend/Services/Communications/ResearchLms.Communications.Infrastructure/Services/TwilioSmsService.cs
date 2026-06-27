using Microsoft.Extensions.Configuration;
using ResearchLms.Shared.Abstractions;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace ResearchLms.Communications.Infrastructure.Services;

public class TwilioSmsService : ISmsService
{
    private readonly string _fromNumber;

    public TwilioSmsService(IConfiguration configuration)
    {
        var accountSid = configuration["Twilio:AccountSid"] ?? string.Empty;
        var authToken = configuration["Twilio:AuthToken"] ?? string.Empty;
        _fromNumber = configuration["Twilio:FromNumber"] ?? string.Empty;

        if (!string.IsNullOrEmpty(accountSid) && !string.IsNullOrEmpty(authToken))
        {
            TwilioClient.Init(accountSid, authToken);
        }
    }

    public async Task SendAsync(string to, string body, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(_fromNumber))
            throw new InvalidOperationException("Twilio from number is not configured.");

        await MessageResource.CreateAsync(
            to: new PhoneNumber(to),
            from: new PhoneNumber(_fromNumber),
            body: body);
    }
}
