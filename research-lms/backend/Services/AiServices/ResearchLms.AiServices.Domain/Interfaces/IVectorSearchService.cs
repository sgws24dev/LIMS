using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IVectorSearchService
{
    Task IndexDocumentAsync(RagDocument document, float[] embedding, CancellationToken ct = default);
    Task<RagResult[]> SearchAsync(float[] queryEmbedding, int topK = 5, Guid? instrumentId = null, Guid? tenantId = null, CancellationToken ct = default);
    Task RemoveDocumentAsync(string documentId, CancellationToken ct = default);
}
