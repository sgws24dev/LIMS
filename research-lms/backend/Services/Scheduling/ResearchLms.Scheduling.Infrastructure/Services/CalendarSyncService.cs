using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Infrastructure.Persistence;

namespace ResearchLms.Scheduling.Infrastructure.Services;

public class CalendarSyncService : ICalendarSyncService
{
    private readonly IBookingRepository _bookingRepo;
    private readonly ICalendarConnectionRepository _connectionRepo;
    private readonly ICalendarSyncLogRepository _syncLogRepo;
    private readonly ICalendarEventMappingRepository _mappingRepo;
    private readonly IMaintenanceWindowRepository _maintenanceRepo;
    private readonly SchedulingDbContext _context;
    private readonly GraphAuthService _graphAuth;
    private readonly IDataProtector _protector;
    private readonly IConfiguration _config;
    private readonly ILogger<CalendarSyncService> _logger;
    private readonly string _redirectUri;
    private readonly HttpClient _http;

    public CalendarSyncService(
        IBookingRepository bookingRepo,
        ICalendarConnectionRepository connectionRepo,
        ICalendarSyncLogRepository syncLogRepo,
        ICalendarEventMappingRepository mappingRepo,
        IMaintenanceWindowRepository maintenanceRepo,
        SchedulingDbContext context,
        GraphAuthService graphAuth,
        IDataProtectionProvider dataProtection,
        IConfiguration config,
        ILogger<CalendarSyncService> logger)
    {
        _bookingRepo = bookingRepo;
        _connectionRepo = connectionRepo;
        _syncLogRepo = syncLogRepo;
        _mappingRepo = mappingRepo;
        _maintenanceRepo = maintenanceRepo;
        _context = context;
        _graphAuth = graphAuth;
        _protector = dataProtection.CreateProtector("CalendarTokenProtector");
        _config = config;
        _logger = logger;
        _redirectUri = config["CalendarSync:RedirectUri"] ?? "http://localhost:3000/scheduling/oauth-callback";
        _http = new HttpClient();
    }

    public string GetAuthorizationUrl(SyncProvider provider, string userId, string redirectUri)
    {
        return provider switch
        {
            SyncProvider.Outlook => _graphAuth.GetAuthorizationUrl(userId, redirectUri),
            SyncProvider.Google => BuildGoogleAuthUrl(userId, redirectUri),
            _ => throw new ArgumentOutOfRangeException(nameof(provider))
        };
    }

    public async Task<CalendarConnection> HandleCallbackAsync(
        SyncProvider provider, string code, string userId, Guid tenantId, CancellationToken ct)
    {
        string accessToken, refreshToken;
        DateTime expiresAt;

        if (provider == SyncProvider.Outlook)
        {
            (accessToken, refreshToken, expiresAt) = await _graphAuth.ExchangeCodeAsync(code, _redirectUri);
        }
        else
        {
            (accessToken, refreshToken, expiresAt) = await ExchangeGoogleCodeAsync(code);
        }

        var existing = await _connectionRepo.GetAsync(Guid.Parse(userId), provider, ct);
        if (existing is not null)
        {
            existing.AccessToken = _protector.Protect(accessToken);
            existing.RefreshToken = _protector.Protect(refreshToken);
            existing.TokenExpiresAt = expiresAt;
            existing.IsActive = true;
            await _connectionRepo.UpdateAsync(existing, ct);
            return existing;
        }

        var connection = new CalendarConnection
        {
            TenantId = tenantId,
            UserId = Guid.Parse(userId),
            Provider = provider,
            AccessToken = _protector.Protect(accessToken),
            RefreshToken = _protector.Protect(refreshToken),
            TokenExpiresAt = expiresAt,
            IsActive = true,
            SyncDirection = SyncDirection.BiDirectional
        };

        return await _connectionRepo.AddAsync(connection, ct);
    }

    public async Task<CalendarSyncLog> SyncOutboundAsync(Guid userId, SyncProvider provider, CancellationToken ct)
    {
        var connection = await _connectionRepo.GetAsync(userId, provider, ct);
        if (connection is null)
            throw new InvalidOperationException($"No active {provider} connection for user {userId}.");

        var token = await EnsureFreshTokenAsync(connection, ct);
        var bookings = await _bookingRepo.GetByUserAndRangeAsync(
            userId, DateTime.UtcNow.AddDays(-30), DateTime.UtcNow.AddDays(30), ct);

        int created = 0, updated = 0, deleted = 0;
        string? errorMessage = null;

        try
        {
            foreach (var booking in bookings.Where(b =>
                b.Status != BookingStatus.Cancelled && b.Status != BookingStatus.NoShow))
            {
                var mapping = await _mappingRepo.GetByBookingIdAsync(booking.Id, provider, ct);
                if (mapping is null)
                {
                    var externalId = await CreateExternalEventAsync(booking, token, connection.ExternalCalendarId, provider);
                    if (externalId is not null)
                    {
                        await _mappingRepo.AddAsync(new CalendarEventMapping
                        {
                            BookingId = booking.Id,
                            Provider = provider,
                            ExternalEventId = externalId
                        }, ct);
                        created++;
                    }
                }
                else
                {
                    await UpdateExternalEventAsync(mapping.ExternalEventId, booking, token, provider);
                    updated++;
                }
            }

            foreach (var booking in bookings.Where(b =>
                b.Status == BookingStatus.Cancelled || b.Status == BookingStatus.NoShow))
            {
                var mapping = await _mappingRepo.GetByBookingIdAsync(booking.Id, provider, ct);
                if (mapping is not null)
                {
                    await DeleteExternalEventAsync(mapping.ExternalEventId, token, provider);
                    await _mappingRepo.DeleteAsync(booking.Id, provider, ct);
                    deleted++;
                }
            }
        }
        catch (Exception ex)
        {
            errorMessage = ex.Message;
            _logger.LogError(ex, "Outbound sync failed for user {UserId}, provider {Provider}", userId, provider);
        }

        connection.LastSyncAt = DateTime.UtcNow;
        await _connectionRepo.UpdateAsync(connection, ct);

        return await CreateSyncLogAsync(connection.Id, connection.TenantId, connection.UserId, connection.Provider,
            "OutboundToProvider",
            errorMessage is null ? "Success" : "Failed", created, updated, deleted, errorMessage, ct);
    }

    public async Task<CalendarSyncLog> SyncInboundAsync(Guid userId, SyncProvider provider, CancellationToken ct)
    {
        var connection = await _connectionRepo.GetAsync(userId, provider, ct);
        if (connection is null)
            throw new InvalidOperationException($"No active {provider} connection for user {userId}.");

        var token = await EnsureFreshTokenAsync(connection, ct);
        int created = 0, updated = 0, deleted = 0;
        string? errorMessage = null;

        try
        {
            var events = await FetchExternalEventsAsync(token, connection.ExternalCalendarId, provider);

            foreach (var evt in events)
            {
                var bookingId = GetResearchLmsBookingId(evt, provider);
                if (bookingId.HasValue) continue;

                var externalId = evt.GetProperty("id").GetString()!;
                var existing = await _context.MaintenanceWindows
                    .FirstOrDefaultAsync(m => m.Reason != null && m.Reason.Contains(externalId), ct);

                if (existing is null)
                {
                    var (start, end, summary) = ParseExternalEvent(evt);
                    var mw = new MaintenanceWindow
                    {
                        ResourceId = Guid.Empty,
                        StartTime = start,
                        EndTime = end,
                        Reason = $"Calendar sync - {provider} - {summary}",
                        Source = $"CalendarSync:{provider}"
                    };
                    _context.MaintenanceWindows.Add(mw);
                    created++;
                }
            }

            await _context.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            errorMessage = ex.Message;
            _logger.LogError(ex, "Inbound sync failed for user {UserId}, provider {Provider}", userId, provider);
        }

        connection.LastSyncAt = DateTime.UtcNow;
        await _connectionRepo.UpdateAsync(connection, ct);

        return await CreateSyncLogAsync(connection.Id, connection.TenantId, connection.UserId, connection.Provider,
            "InboundFromProvider",
            errorMessage is null ? "Success" : "Failed", created, updated, deleted, errorMessage, ct);
    }

    public async Task<CalendarSyncLog> SyncBiDirectionalAsync(Guid userId, SyncProvider provider, CancellationToken ct)
    {
        var outboundLog = await SyncOutboundAsync(userId, provider, ct);
        var inboundLog = await SyncInboundAsync(userId, provider, ct);

        var combined = outboundLog.Status == "Success" && inboundLog.Status == "Success" ? "Success"
            : outboundLog.Status == "Failed" && inboundLog.Status == "Failed" ? "Failed"
            : "PartialSuccess";

        return await CreateSyncLogAsync(
            Guid.Empty, Guid.Empty, userId, provider,
            "BiDirectional", combined,
            outboundLog.EventsCreated + inboundLog.EventsCreated,
            outboundLog.EventsUpdated + inboundLog.EventsUpdated,
            outboundLog.EventsDeleted + inboundLog.EventsDeleted,
            null, ct);
    }

    public async Task DisconnectAsync(Guid userId, SyncProvider provider, CancellationToken ct)
    {
        var connection = await _connectionRepo.GetAsync(userId, provider, ct);
        if (connection is not null)
        {
            connection.IsActive = false;
            await _connectionRepo.UpdateAsync(connection, ct);
        }
    }

    public async Task<CalendarSyncStatusDto> GetStatusAsync(Guid userId, CancellationToken ct)
    {
        var connections = await _connectionRepo.GetActiveAsync(userId, ct);

        var dtos = connections.Select(c => new CalendarConnectionDto(
            c.Id, c.Provider, c.IsActive, c.SyncDirection, c.LastSyncAt, c.ExternalCalendarId));

        return new CalendarSyncStatusDto(
            dtos,
            connections.Any(c => c.Provider == SyncProvider.Outlook),
            connections.Any(c => c.Provider == SyncProvider.Google),
            connections.FirstOrDefault(c => c.Provider == SyncProvider.Outlook)?.LastSyncAt,
            connections.FirstOrDefault(c => c.Provider == SyncProvider.Google)?.LastSyncAt
        );
    }

    private async Task<string> EnsureFreshTokenAsync(CalendarConnection connection, CancellationToken ct)
    {
        if (connection.TokenExpiresAt > DateTime.UtcNow.AddMinutes(5))
            return _protector.Unprotect(connection.AccessToken);

        var refreshToken = _protector.Unprotect(connection.RefreshToken);

        var newToken = connection.Provider == SyncProvider.Outlook
            ? await _graphAuth.RefreshAccessTokenAsync(refreshToken, _redirectUri)
            : await RefreshGoogleTokenAsync(refreshToken);

        connection.AccessToken = _protector.Protect(newToken);
        connection.TokenExpiresAt = DateTime.UtcNow.AddHours(1);
        await _connectionRepo.UpdateAsync(connection, ct);
        return newToken;
    }

    private async Task<string?> CreateExternalEventAsync(Booking booking, string token, string? calendarId, SyncProvider provider)
    {
        try
        {
            if (provider == SyncProvider.Outlook)
                return await CreateOutlookEventAsync(booking, token, calendarId);
            else
                return await CreateGoogleEventAsync(booking, token, calendarId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to create external event for booking {BookingId}", booking.Id);
            return null;
        }
    }

    private async Task<string> CreateOutlookEventAsync(Booking booking, string token, string? calendarId)
    {
        var url = calendarId is not null
            ? $"https://graph.microsoft.com/v1.0/me/calendars/{calendarId}/events"
            : "https://graph.microsoft.com/v1.0/me/events";

        var body = new
        {
            subject = $"[ResearchLMS] {booking.Title}",
            body = new
            {
                contentType = "text",
                content = $"Booked via ResearchLMS\nResource: {booking.ResourceId}\nPurpose: {booking.Purpose ?? "N/A"}"
            },
            start = new { dateTime = booking.StartTime.ToString("o"), timeZone = "UTC" },
            end = new { dateTime = booking.EndTime.ToString("o"), timeZone = "UTC" },
            singleValueExtendedProperties = new[]
            {
                new
                {
                    id = "String {d3c5c3e2-5e5a-4f5a-9f5a-3e5a5a5a5a5a} Name ResearchLmsBookingId",
                    value = booking.Id.ToString()
                }
            }
        };

        var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = JsonContent.Create(body)
        };
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var response = await _http.SendAsync(request);
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        return json.GetProperty("id").GetString()!;
    }

    private async Task<string> CreateGoogleEventAsync(Booking booking, string token, string? calendarId)
    {
        var calId = calendarId ?? "primary";
        var url = $"https://www.googleapis.com/calendar/v3/calendars/{Uri.EscapeDataString(calId)}/events";

        var body = new
        {
            summary = $"[ResearchLMS] {booking.Title}",
            description = $"Resource: {booking.ResourceId}\nPurpose: {booking.Purpose ?? "N/A"}",
            start = new { dateTime = booking.StartTime.ToString("o"), timeZone = "UTC" },
            end = new { dateTime = booking.EndTime.ToString("o"), timeZone = "UTC" },
            extendedProperties = new
            {
                @private = new Dictionary<string, string>
                {
                    ["researchLmsBookingId"] = booking.Id.ToString()
                }
            }
        };

        var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = JsonContent.Create(body)
        };
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var response = await _http.SendAsync(request);
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        return json.GetProperty("id").GetString()!;
    }

    private async Task UpdateExternalEventAsync(string externalEventId, Booking booking, string token, SyncProvider provider)
    {
        if (provider == SyncProvider.Outlook)
        {
            var url = $"https://graph.microsoft.com/v1.0/me/events/{externalEventId}";
            var body = new
            {
                subject = $"[ResearchLMS] {booking.Title}",
                start = new { dateTime = booking.StartTime.ToString("o"), timeZone = "UTC" },
                end = new { dateTime = booking.EndTime.ToString("o"), timeZone = "UTC" }
            };
            var request = new HttpRequestMessage(HttpMethod.Patch, url) { Content = JsonContent.Create(body) };
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            await _http.SendAsync(request);
        }
        else
        {
            var calId = "primary";
            var url = $"https://www.googleapis.com/calendar/v3/calendars/{Uri.EscapeDataString(calId)}/events/{externalEventId}";
            var body = new
            {
                summary = $"[ResearchLMS] {booking.Title}",
                start = new { dateTime = booking.StartTime.ToString("o"), timeZone = "UTC" },
                end = new { dateTime = booking.EndTime.ToString("o"), timeZone = "UTC" }
            };
            var request = new HttpRequestMessage(HttpMethod.Put, url) { Content = JsonContent.Create(body) };
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            await _http.SendAsync(request);
        }
    }

    private async Task DeleteExternalEventAsync(string externalEventId, string token, SyncProvider provider)
    {
        var url = provider == SyncProvider.Outlook
            ? $"https://graph.microsoft.com/v1.0/me/events/{externalEventId}"
            : $"https://www.googleapis.com/calendar/v3/calendars/primary/events/{externalEventId}";

        var request = new HttpRequestMessage(HttpMethod.Delete, url);
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        await _http.SendAsync(request);
    }

    private async Task<List<JsonElement>> FetchExternalEventsAsync(string token, string? calendarId, SyncProvider provider)
    {
        var results = new List<JsonElement>();
        var from = DateTime.UtcNow.AddDays(-30).ToString("o");
        var to = DateTime.UtcNow.AddDays(30).ToString("o");

        var url = provider == SyncProvider.Outlook
            ? $"https://graph.microsoft.com/v1.0/me/events?$top=100&$filter=start/dateTime ge '{Uri.EscapeDataString(from)}' and end/dateTime le '{Uri.EscapeDataString(to)}'"
            : $"https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin={Uri.EscapeDataString(from)}&timeMax={Uri.EscapeDataString(to)}";

        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var response = await _http.SendAsync(request);
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();

        if (json.TryGetProperty("value", out var value))
        {
            foreach (var item in value.EnumerateArray())
                results.Add(item);
        }
        else if (json.TryGetProperty("items", out var items))
        {
            foreach (var item in items.EnumerateArray())
                results.Add(item);
        }

        return results;
    }

    private Guid? GetResearchLmsBookingId(JsonElement evt, SyncProvider provider)
    {
        try
        {
            if (provider == SyncProvider.Outlook)
            {
                if (evt.TryGetProperty("singleValueExtendedProperties", out var props))
                {
                    foreach (var p in props.EnumerateArray())
                    {
                        if (p.GetProperty("id").GetString()?.Contains("ResearchLmsBookingId") == true)
                        {
                            if (Guid.TryParse(p.GetProperty("value").GetString(), out var id))
                                return id;
                        }
                    }
                }
            }
            else
            {
                if (evt.TryGetProperty("extendedProperties", out var extProps))
                {
                    var priv = extProps.GetProperty("private");
                    if (priv.TryGetProperty("researchLmsBookingId", out var val))
                    {
                        if (Guid.TryParse(val.GetString(), out var id))
                            return id;
                    }
                }
            }
        }
        catch
        {
        }

        return null;
    }

    private (DateTime Start, DateTime End, string Summary) ParseExternalEvent(JsonElement evt)
    {
        var startStr = evt.GetProperty("start").GetProperty("dateTime").GetString()!;
        var endStr = evt.GetProperty("end").GetProperty("dateTime").GetString()!;
        var summary = evt.TryGetProperty("subject", out var s) ? s.GetString() ?? "External Event"
            : evt.TryGetProperty("summary", out var g) ? g.GetString() ?? "External Event"
            : "External Event";

        return (DateTime.Parse(startStr), DateTime.Parse(endStr), summary);
    }

    private string BuildGoogleAuthUrl(string userId, string redirectUri)
    {
        var clientId = _config["GoogleCalendar:ClientId"] ?? throw new InvalidOperationException("GoogleCalendar:ClientId is not configured.");
        return $"https://accounts.google.com/o/oauth2/v2/auth"
             + $"?client_id={clientId}"
             + $"&response_type=code"
             + $"&redirect_uri={Uri.EscapeDataString(redirectUri)}"
             + $"&scope=https://www.googleapis.com/auth/calendar"
             + $"&access_type=offline"
             + $"&state={userId}";
    }

    private async Task<(string AccessToken, string RefreshToken, DateTime ExpiresAt)> ExchangeGoogleCodeAsync(string code)
    {
        var clientId = _config["GoogleCalendar:ClientId"]!;
        var clientSecret = _config["GoogleCalendar:ClientSecret"]!;

        var response = await _http.PostAsync("https://oauth2.googleapis.com/token",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["code"] = code,
                ["grant_type"] = "authorization_code",
                ["redirect_uri"] = _redirectUri
            }));

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        var access = json.GetProperty("access_token").GetString()!;
        var refresh = json.GetProperty("refresh_token").GetString()!;
        var expiresIn = json.GetProperty("expires_in").GetInt32();
        return (access, refresh, DateTime.UtcNow.AddSeconds(expiresIn));
    }

    private async Task<string> RefreshGoogleTokenAsync(string refreshToken)
    {
        var clientId = _config["GoogleCalendar:ClientId"]!;
        var clientSecret = _config["GoogleCalendar:ClientSecret"]!;

        var response = await _http.PostAsync("https://oauth2.googleapis.com/token",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["refresh_token"] = refreshToken,
                ["grant_type"] = "refresh_token"
            }));

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        return json.GetProperty("access_token").GetString()!;
    }

    private async Task<CalendarSyncLog> CreateSyncLogAsync(
        Guid calendarConnectionId, Guid tenantId, Guid userId, SyncProvider provider,
        string direction, string status,
        int created, int updated, int deleted, string? error, CancellationToken ct)
    {
        var log = new CalendarSyncLog
        {
            CalendarConnectionId = calendarConnectionId,
            TenantId = tenantId,
            UserId = userId,
            Provider = provider,
            Direction = direction,
            Status = status,
            EventsCreated = created,
            EventsUpdated = updated,
            EventsDeleted = deleted,
            ErrorMessage = error,
            SyncedAt = DateTime.UtcNow
        };
        return await _syncLogRepo.AddAsync(log, ct);
    }
}
