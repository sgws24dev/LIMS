using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace ResearchLms.Scheduling.Infrastructure.Services;

public class GraphAuthService
{
    private readonly string _clientId;
    private readonly string _clientSecret;
    private readonly string _tenantId;
    private readonly HttpClient _http;

    public GraphAuthService(IConfiguration config)
    {
        _clientId = config["MicrosoftGraph:ClientId"] ?? throw new InvalidOperationException("MicrosoftGraph:ClientId is not configured.");
        _clientSecret = config["MicrosoftGraph:ClientSecret"] ?? throw new InvalidOperationException("MicrosoftGraph:ClientSecret is not configured.");
        _tenantId = config["MicrosoftGraph:TenantId"] ?? throw new InvalidOperationException("MicrosoftGraph:TenantId is not configured.");
        _http = new HttpClient();
    }

    public string GetAuthorizationUrl(string userId, string redirectUri)
    {
        return $"https://login.microsoftonline.com/{_tenantId}/oauth2/v2.0/authorize"
             + $"?client_id={_clientId}"
             + $"&response_type=code"
             + $"&redirect_uri={Uri.EscapeDataString(redirectUri)}"
             + $"&scope=Calendars.ReadWrite+offline_access"
             + $"&state={userId}";
    }

    public async Task<(string AccessToken, string RefreshToken, DateTime ExpiresAt)> ExchangeCodeAsync(string code, string redirectUri)
    {
        var response = await _http.PostAsync(
            $"https://login.microsoftonline.com/{_tenantId}/oauth2/v2.0/token",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = _clientId,
                ["client_secret"] = _clientSecret,
                ["code"] = code,
                ["grant_type"] = "authorization_code",
                ["redirect_uri"] = redirectUri
            }));

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        var access = json.GetProperty("access_token").GetString()!;
        var refresh = json.GetProperty("refresh_token").GetString()!;
        var expiresIn = json.GetProperty("expires_in").GetInt32();
        return (access, refresh, DateTime.UtcNow.AddSeconds(expiresIn));
    }

    public async Task<string> RefreshAccessTokenAsync(string refreshToken, string redirectUri)
    {
        var response = await _http.PostAsync(
            $"https://login.microsoftonline.com/{_tenantId}/oauth2/v2.0/token",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = _clientId,
                ["client_secret"] = _clientSecret,
                ["refresh_token"] = refreshToken,
                ["grant_type"] = "refresh_token",
                ["redirect_uri"] = redirectUri
            }));

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        return json.GetProperty("access_token").GetString()!;
    }
}
