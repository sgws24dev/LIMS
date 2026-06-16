using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Infrastructure.Persistence;

namespace ResearchLms.Scheduling.Infrastructure.Services;

public class TrainerSyncService : ITrainerSyncService
{
    private readonly ITrainerAvailabilityRepository _trainerRepo;
    private readonly ICalendarConnectionRepository _connectionRepo;
    private readonly SchedulingDbContext _context;
    private readonly ILogger<TrainerSyncService> _logger;
    private readonly HttpClient _http;

    public TrainerSyncService(
        ITrainerAvailabilityRepository trainerRepo,
        ICalendarConnectionRepository connectionRepo,
        SchedulingDbContext context,
        ILogger<TrainerSyncService> logger)
    {
        _trainerRepo = trainerRepo;
        _connectionRepo = connectionRepo;
        _context = context;
        _logger = logger;
        _http = new HttpClient();
    }

    public async Task SyncTrainerCalendarAsync(Guid userId, SyncProvider provider, CancellationToken ct)
    {
        var connection = await _connectionRepo.GetAsync(userId, provider, ct);
        if (connection is null) return;

        // Decrypt token
        // For simplicity, assume token is plaintext. In production use IDataProtector
        var token = connection.AccessToken;
        var from = DateTime.UtcNow.ToString("o");
        var to = DateTime.UtcNow.AddDays(90).ToString("o");

        var events = await FetchExternalEventsAsync(token, connection.ExternalCalendarId, provider, from, to);

        var externalIds = events
            .Where(e => GetResearchLmsBookingId(e, provider) is null)
            .Select(e => e.GetProperty("id").GetString()!)
            .ToList();

        var existingExternalIds = await _trainerRepo.GetExternalEventIdsAsync(userId, ct);
        var staleIds = existingExternalIds.Except(externalIds).ToHashSet();

        foreach (var evt in events)
        {
            if (GetResearchLmsBookingId(evt, provider) is not null) continue;

            var externalId = evt.GetProperty("id").GetString()!;
            var (start, end, summary) = ParseExternalEvent(evt);
            var dayOfWeek = start.DayOfWeek;
            var startTime = TimeOnly.FromDateTime(start);
            var endTime = TimeOnly.FromDateTime(end);
            var date = DateOnly.FromDateTime(start);

            var existing = await _context.TrainerAvailability
                .FirstOrDefaultAsync(t => t.ExternalEventId == externalId && t.UserId == userId, ct);

            if (existing is not null)
            {
                existing.StartTime = startTime;
                existing.EndTime = endTime;
                existing.IsAvailable = false;
                await _trainerRepo.UpdateAsync(existing, ct);
            }
            else
            {
                var ta = new TrainerAvailability
                {
                    TenantId = connection.TenantId,
                    UserId = userId,
                    UserName = "Synced",
                    DayOfWeek = dayOfWeek,
                    StartTime = startTime,
                    EndTime = endTime,
                    IsAvailable = false,
                    EffectiveFrom = date,
                    Source = provider == SyncProvider.Outlook ? AvailabilitySource.SyncedOutlook : AvailabilitySource.SyncedGoogle,
                    ExternalEventId = externalId,
                    Notes = $"Synced: {summary}"
                };
                await _trainerRepo.AddAsync(ta, ct);
            }
        }

        // Delete stale entries
        foreach (var staleId in staleIds)
        {
            var stale = await _context.TrainerAvailability
                .FirstOrDefaultAsync(t => t.ExternalEventId == staleId && t.UserId == userId, ct);
            if (stale is not null)
            {
                stale.MarkDeleted("Sync cleanup");
                await _trainerRepo.UpdateAsync(stale, ct);
            }
        }
    }

    public async Task<bool> IsTrainerAvailableAsync(Guid userId, DateTime slotStart, DateTime slotEnd, CancellationToken ct)
    {
        var dayOfWeek = slotStart.DayOfWeek;
        var startTime = TimeOnly.FromDateTime(slotStart);
        var endTime = TimeOnly.FromDateTime(slotEnd);
        var date = DateOnly.FromDateTime(slotStart);

        var hasBlock = await _context.TrainerAvailability
            .AnyAsync(t => t.UserId == userId
                && t.DayOfWeek == dayOfWeek
                && !t.IsAvailable
                && t.StartTime < endTime
                && t.EndTime > startTime
                && t.EffectiveFrom <= date
                && (t.EffectiveTo == null || t.EffectiveTo >= date)
                && !t.IsDeleted, ct);

        return !hasBlock;
    }

    public async Task<IEnumerable<TrainerAvailability>> GetAvailableTrainersAsync(
        string requiredRole, DateTime slotStart, DateTime slotEnd, CancellationToken ct)
    {
        var dayOfWeek = slotStart.DayOfWeek;
        var startTime = TimeOnly.FromDateTime(slotStart);
        var endTime = TimeOnly.FromDateTime(slotEnd);
        var date = DateOnly.FromDateTime(slotStart);

        var blockedUserIds = await _context.TrainerAvailability
            .Where(t => t.DayOfWeek == dayOfWeek && !t.IsAvailable && !t.IsDeleted
                && t.StartTime < endTime && t.EndTime > startTime
                && t.EffectiveFrom <= date
                && (t.EffectiveTo == null || t.EffectiveTo >= date))
            .Select(t => t.UserId)
            .Distinct()
            .ToListAsync(ct);

        var available = await (
            from t in _context.TrainerAvailability
            join c in _context.UserCompetencyCache
                on new { UserId = t.UserId, Competency = requiredRole }
                equals new { c.UserId, Competency = c.CompetencyCode }
            where t.DayOfWeek == dayOfWeek && t.IsAvailable && !t.IsDeleted
                && t.StartTime <= startTime && t.EndTime >= endTime
                && t.EffectiveFrom <= date
                && (t.EffectiveTo == null || t.EffectiveTo >= date)
                && !blockedUserIds.Contains(t.UserId)
            select t
        ).Distinct().ToListAsync(ct);

        return available;
    }

    private async Task<List<JsonElement>> FetchExternalEventsAsync(
        string token, string? calendarId, SyncProvider provider, string from, string to)
    {
        var results = new List<JsonElement>();
        string url;

        if (provider == SyncProvider.Outlook)
        {
            var calPath = calendarId is not null
                ? $"me/calendars/{calendarId}"
                : "me";
            url = $"https://graph.microsoft.com/v1.0/{calPath}/events?$top=200&$filter=start/dateTime ge '{Uri.EscapeDataString(from)}' and end/dateTime le '{Uri.EscapeDataString(to)}'";
        }
        else
        {
            var calId = calendarId ?? "primary";
            url = $"https://www.googleapis.com/calendar/v3/calendars/{Uri.EscapeDataString(calId)}/events?timeMin={Uri.EscapeDataString(from)}&timeMax={Uri.EscapeDataString(to)}&singleEvents=true";
        }

        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var response = await _http.SendAsync(request);
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();

        if (json.TryGetProperty("value", out var value))
        {
            foreach (var item in value.EnumerateArray()) results.Add(item);
        }
        else if (json.TryGetProperty("items", out var items))
        {
            foreach (var item in items.EnumerateArray()) results.Add(item);
        }

        return results;
    }

    private static Guid? GetResearchLmsBookingId(JsonElement evt, SyncProvider provider)
    {
        try
        {
            if (provider == SyncProvider.Outlook)
            {
                if (evt.TryGetProperty("singleValueExtendedProperties", out var props))
                {
                    foreach (var p in props.EnumerateArray())
                        if (p.GetProperty("id").GetString()?.Contains("ResearchLmsBookingId") == true
                            && Guid.TryParse(p.GetProperty("value").GetString(), out var id))
                            return id;
                }
            }
            else
            {
                if (evt.TryGetProperty("extendedProperties", out var extProps)
                    && extProps.TryGetProperty("private", out var priv)
                    && priv.TryGetProperty("researchLmsBookingId", out var val)
                    && Guid.TryParse(val.GetString(), out var id))
                    return id;
            }
        }
        catch { }
        return null;
    }

    private static (DateTime Start, DateTime End, string Summary) ParseExternalEvent(JsonElement evt)
    {
        var startStr = evt.GetProperty("start").GetProperty("dateTime").GetString()!;
        var endStr = evt.GetProperty("end").GetProperty("dateTime").GetString()!;
        var summary = evt.TryGetProperty("subject", out var s) ? s.GetString() ?? "External Event"
            : evt.TryGetProperty("summary", out var g) ? g.GetString() ?? "External Event"
            : "External Event";
        return (DateTime.Parse(startStr), DateTime.Parse(endStr), summary);
    }
}
