using ResearchLms.Communications.Domain.Entities;
using ResearchLms.Communications.Domain.Enums;

namespace ResearchLms.Communications.Domain.Interfaces;

public interface IAnnouncementRepository
{
    Task<IReadOnlyList<Announcement>> GetAllAsync(Guid tenantId, string? audience = null, AnnouncementPriority? minPriority = null, DateTime? from = null, DateTime? to = null, CancellationToken ct = default);
    Task<Announcement?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Announcement announcement, CancellationToken ct = default);
    Task UpdateAsync(Announcement announcement, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
