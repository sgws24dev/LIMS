using Microsoft.AspNetCore.SignalR;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Infrastructure.Services.Iot;

public class IoTDataHub : Hub
{
    private readonly IIoTTelemetryRepository _telemetryRepo;
    private readonly ITenantContext _tenant;

    public IoTDataHub(IIoTTelemetryRepository telemetryRepo, ITenantContext tenant)
    {
        _telemetryRepo = telemetryRepo;
        _tenant = tenant;
    }

    public override async Task OnConnectedAsync()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant_{_tenant.TenantId}");
        await base.OnConnectedAsync();
    }

    public async Task SubscribeToInstrument(Guid instrumentId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"instrument_{instrumentId}");
    }

    public async Task UnsubscribeFromInstrument(Guid instrumentId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"instrument_{instrumentId}");
    }

    public async Task GetLatestTelemetry(Guid instrumentId, string metricName)
    {
        var point = await _telemetryRepo.GetLatestAsync(_tenant.TenantId, instrumentId, metricName);
        await Clients.Caller.SendAsync("TelemetryUpdate", point);
    }
}
