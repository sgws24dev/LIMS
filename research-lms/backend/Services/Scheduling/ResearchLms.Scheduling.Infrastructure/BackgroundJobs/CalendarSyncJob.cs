using Microsoft.Extensions.Logging;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Infrastructure.BackgroundJobs;

public class CalendarSyncJob : ICalendarSyncJob
{
    private readonly ICalendarSyncService _syncService;
    private readonly ICalendarConnectionRepository _connectionRepo;
    private readonly ILogger<CalendarSyncJob> _logger;

    public CalendarSyncJob(
        ICalendarSyncService syncService,
        ICalendarConnectionRepository connectionRepo,
        ILogger<CalendarSyncJob> logger)
    {
        _syncService = syncService;
        _connectionRepo = connectionRepo;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        var connections = await _connectionRepo.GetAllActiveAsync(CancellationToken.None);

        foreach (var connection in connections)
        {
            try
            {
                if (connection.SyncDirection == SyncDirection.OneWay_OutToIn)
                {
                    await _syncService.SyncOutboundAsync(connection.UserId, connection.Provider, CancellationToken.None);
                }
                else if (connection.SyncDirection == SyncDirection.OneWay_InToOut)
                {
                    await _syncService.SyncInboundAsync(connection.UserId, connection.Provider, CancellationToken.None);
                }
                else
                {
                    await _syncService.SyncBiDirectionalAsync(connection.UserId, connection.Provider, CancellationToken.None);
                }

                _logger.LogInformation(
                    "Calendar sync completed for user {UserId}, provider {Provider}",
                    connection.UserId, connection.Provider);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Calendar sync failed for UserId {UserId}, Provider {Provider}",
                    connection.UserId, connection.Provider);
            }
        }
    }
}
