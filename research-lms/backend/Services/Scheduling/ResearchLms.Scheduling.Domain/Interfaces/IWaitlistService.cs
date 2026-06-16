using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Domain.Interfaces;

public interface IWaitlistService
{
    Task<Guid> JoinAsync(Guid resourceId, ResourceType resourceType,
        DateOnly requestedDate, TimeOnly requestedStartTime, TimeOnly requestedEndTime,
        Guid userId, string userName, string? notes, CancellationToken ct);

    Task<int> GetPositionAsync(Guid entryId, CancellationToken ct);

    Task PromoteNextAsync(Guid resourceId, DateOnly date,
        TimeOnly start, TimeOnly end, CancellationToken ct);

    Task ExpireStalePromotionsAsync(CancellationToken ct);
}
