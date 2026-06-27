using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Communications.Infrastructure.Services;

public class TeamsNotificationService : ITeamsNotificationService
{
    private readonly HttpClient _httpClient;

    public TeamsNotificationService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task SendAsync(string webhookUrl, string title, string message, MessageCardColor color = MessageCardColor.Default, CancellationToken ct = default)
    {
        var colorHex = color switch
        {
            MessageCardColor.Green => "00FF00",
            MessageCardColor.Red => "FF0000",
            MessageCardColor.Yellow => "FFFF00",
            _ => "0078D4"
        };

        var card = new
        {
            type = "message",
            attachments = new[]
            {
                new
                {
                    contentType = "application/vnd.microsoft.card.adaptive",
                    content = new
                    {
                        type = "AdaptiveCard",
                        version = "1.4",
                        body = new object[]
                        {
                            new { type = "TextBlock", text = title, weight = "Bolder", size = "Medium" },
                            new { type = "TextBlock", text = message, wrap = true }
                        },
                        msteams = new { width = "Full" }
                    }
                }
            }
        };

        var json = JsonSerializer.Serialize(card);
        var request = new HttpRequestMessage(HttpMethod.Post, webhookUrl)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };

        var response = await _httpClient.SendAsync(request, ct);
        response.EnsureSuccessStatusCode();
    }
}
