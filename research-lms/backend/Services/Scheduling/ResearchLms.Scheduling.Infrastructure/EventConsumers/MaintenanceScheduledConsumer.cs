using MassTransit;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Shared.Events;

namespace ResearchLms.Scheduling.Infrastructure.EventConsumers;

public class MaintenanceScheduledConsumer : IConsumer<MaintenanceScheduledEvent>
{
    private readonly IMaintenanceWindowRepository _repo;
    private readonly IAvailabilityService _availabilityService;

    public MaintenanceScheduledConsumer(
        IMaintenanceWindowRepository repo,
        IAvailabilityService availabilityService)
    {
        _repo = repo;
        _availabilityService = availabilityService;
    }

    public async Task Consume(ConsumeContext<MaintenanceScheduledEvent> context)
    {
        var msg = context.Message;

        var window = new MaintenanceWindow
        {
            ResourceId = msg.AssetId,
            TenantId = msg.TenantId,
            StartTime = msg.StartTime,
            EndTime = msg.EndTime,
            Reason = msg.Type,
            Source = "Facility"
        };

        await _repo.AddAsync(window, context.CancellationToken);

        var startDate = DateOnly.FromDateTime(msg.StartTime);
        var endDate = DateOnly.FromDateTime(msg.EndTime);
        var current = startDate;
        while (current <= endDate)
        {
            await _availabilityService.InvalidateCacheAsync(msg.AssetId, current);
            current = current.AddDays(1);
        }
    }
}
