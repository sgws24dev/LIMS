using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IRagService
{
    Task IndexDocumentAsync(RagDocument document, CancellationToken ct = default);
    Task<RagResult[]> SearchAsync(string query, int topK = 5, Guid? instrumentId = null, Guid? tenantId = null, CancellationToken ct = default);
    Task RemoveDocumentAsync(string documentId, CancellationToken ct = default);
}
