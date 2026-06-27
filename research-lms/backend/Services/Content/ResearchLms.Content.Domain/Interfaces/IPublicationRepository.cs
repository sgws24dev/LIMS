using ResearchLms.Content.Domain.Entities;

namespace ResearchLms.Content.Domain.Interfaces;

public interface IPublicationRepository
{
    Task<IReadOnlyList<Publication>> SearchAsync(Guid tenantId, string? searchTerm = null,
        string? type = null, string? author = null, int? year = null, string? journal = null,
        CancellationToken ct = default);
    Task<Publication?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Publication?> GetByDoiAsync(string doi, CancellationToken ct = default);
    Task AddAsync(Publication publication, CancellationToken ct = default);
    Task UpdateAsync(Publication publication, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Guid>> GetLinkedInstrumentIdsAsync(Guid publicationId, CancellationToken ct = default);
    Task AddInstrumentLinkAsync(Guid publicationId, Guid instrumentId, CancellationToken ct = default);
    Task RemoveInstrumentLinkAsync(Guid publicationId, Guid instrumentId, CancellationToken ct = default);
}
