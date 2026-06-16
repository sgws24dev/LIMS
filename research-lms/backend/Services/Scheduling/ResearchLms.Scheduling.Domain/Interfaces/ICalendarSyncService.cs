using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Domain.Interfaces;

public interface ICalendarSyncService
{
    string GetAuthorizationUrl(SyncProvider provider, string userId, string redirectUri);
    Task<CalendarConnection> HandleCallbackAsync(SyncProvider provider, string code, string userId, Guid tenantId, CancellationToken ct);
    Task<CalendarSyncLog> SyncOutboundAsync(Guid userId, SyncProvider provider, CancellationToken ct);
    Task<CalendarSyncLog> SyncInboundAsync(Guid userId, SyncProvider provider, CancellationToken ct);
    Task<CalendarSyncLog> SyncBiDirectionalAsync(Guid userId, SyncProvider provider, CancellationToken ct);
    Task DisconnectAsync(Guid userId, SyncProvider provider, CancellationToken ct);
    Task<CalendarSyncStatusDto> GetStatusAsync(Guid userId, CancellationToken ct);
}

public interface ICalendarConnectionRepository
{
    Task<CalendarConnection?> GetAsync(Guid userId, SyncProvider provider, CancellationToken ct);
    Task<IEnumerable<CalendarConnection>> GetActiveAsync(Guid userId, CancellationToken ct);
    Task<IEnumerable<CalendarConnection>> GetAllActiveAsync(CancellationToken ct);
    Task<CalendarConnection> AddAsync(CalendarConnection connection, CancellationToken ct);
    Task UpdateAsync(CalendarConnection connection, CancellationToken ct);
}

public interface ICalendarSyncLogRepository
{
    Task<CalendarSyncLog> AddAsync(CalendarSyncLog log, CancellationToken ct);
    Task<(IEnumerable<CalendarSyncLog> Items, int TotalCount)> GetPagedAsync(Guid userId, int page, int pageSize, CancellationToken ct);
}

public interface ICalendarEventMappingRepository
{
    Task<CalendarEventMapping?> GetByBookingIdAsync(Guid bookingId, SyncProvider provider, CancellationToken ct);
    Task<CalendarEventMapping> AddAsync(CalendarEventMapping mapping, CancellationToken ct);
    Task DeleteAsync(Guid bookingId, SyncProvider provider, CancellationToken ct);
}

public interface ICalendarSyncJob
{
    Task ExecuteAsync();
}

public record CalendarSyncStatusDto(
    IEnumerable<CalendarConnectionDto> Connections,
    bool HasOutlookConnection,
    bool HasGoogleConnection,
    DateTime? OutlookLastSync,
    DateTime? GoogleLastSync
);

public record CalendarConnectionDto(
    Guid Id,
    SyncProvider Provider,
    bool IsConnected,
    SyncDirection SyncDirection,
    DateTime? LastSyncAt,
    string? ExternalCalendarId
);
