using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Domain.Interfaces;

public interface IBookingResourceRepository
{
    Task<BookingResource?> GetByResourceIdAsync(Guid resourceId, CancellationToken ct);
    Task UpsertAsync(BookingResource resource, CancellationToken ct);
    Task DeactivateAsync(Guid resourceId, CancellationToken ct);
    Task<IEnumerable<BookingResource>> SearchAsync(
        string? query, ResourceType? type, Guid? tenantId, CancellationToken ct);
}
