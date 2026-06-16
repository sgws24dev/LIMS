using MassTransit;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Shared.Events;

namespace ResearchLms.Scheduling.Infrastructure.EventConsumers;

public class AssetDecommissionedEventConsumer : IConsumer<AssetDecommissionedEvent>
{
    private readonly IBookingResourceRepository _resourceRepo;

    public AssetDecommissionedEventConsumer(IBookingResourceRepository resourceRepo)
    {
        _resourceRepo = resourceRepo;
    }

    public async Task Consume(ConsumeContext<AssetDecommissionedEvent> context)
    {
        await _resourceRepo.DeactivateAsync(
            context.Message.AssetId, context.CancellationToken);
    }
}
