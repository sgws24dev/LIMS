using MassTransit;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Shared.Events;

namespace ResearchLms.Scheduling.Infrastructure.EventConsumers;

public class AssetCreatedEventConsumer : IConsumer<AssetCreatedEvent>
{
    private readonly IBookingResourceRepository _resourceRepo;

    public AssetCreatedEventConsumer(IBookingResourceRepository resourceRepo)
    {
        _resourceRepo = resourceRepo;
    }

    public async Task Consume(ConsumeContext<AssetCreatedEvent> context)
    {
        var msg = context.Message;

        var resource = new BookingResource
        {
            ResourceId = msg.AssetId,
            TenantId = msg.TenantId,
            Name = msg.Name,
            Identifier = msg.Identifier,
            ResourceType = Enum.Parse<Domain.Enums.ResourceType>(msg.AssetType),
            Location = msg.Location,
            FacilityId = msg.FacilityId,
            FacilityName = msg.FacilityName,
            IsActive = true,
            LastSyncedAt = DateTime.UtcNow
        };

        await _resourceRepo.UpsertAsync(resource, context.CancellationToken);
    }
}
