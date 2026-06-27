using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Infrastructure.Services.VectorSearch;

public class InMemoryVectorService : IVectorSearchService
{
    private readonly List<IndexedDocument> _documents = new();
    private readonly object _lock = new();

    public Task IndexDocumentAsync(RagDocument document, float[] embedding, CancellationToken ct)
    {
        lock (_lock)
        {
            var existing = _documents.FindIndex(d => d.DocumentId == document.Id);
            if (existing >= 0)
                _documents[existing] = new IndexedDocument(document, embedding);
            else
                _documents.Add(new IndexedDocument(document, embedding));
        }
        return Task.CompletedTask;
    }

    public Task<RagResult[]> SearchAsync(float[] queryEmbedding, int topK, Guid? instrumentId, Guid? tenantId, CancellationToken ct)
    {
        List<(IndexedDocument Doc, double Score)> scored;
        lock (_lock)
        {
            var filtered = _documents.AsEnumerable();

            if (tenantId.HasValue)
                filtered = filtered.Where(d => d.Document.TenantId == tenantId.Value);
            if (instrumentId.HasValue)
                filtered = filtered.Where(d => d.Document.InstrumentId == instrumentId.Value);

            scored = filtered
                .Select(d => (Doc: d, Score: CosineSimilarity(queryEmbedding, d.Embedding)))
                .OrderByDescending(x => x.Score)
                .Take(topK)
                .ToList();
        }

        var results = scored.Select(x => new RagResult(
            x.Doc.Document.Content,
            x.Score,
            x.Doc.Document.Title,
            $"sourceType={x.Doc.Document.SourceType}, sourceUrl={x.Doc.Document.SourceUrl ?? "null"}"
        )).ToArray();

        return Task.FromResult(results);
    }

    public Task RemoveDocumentAsync(string documentId, CancellationToken ct)
    {
        lock (_lock)
        {
            _documents.RemoveAll(d => d.DocumentId == documentId);
        }
        return Task.CompletedTask;
    }

    private static double CosineSimilarity(float[] a, float[] b)
    {
        if (a.Length != b.Length) return 0;

        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.Length; i++)
        {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        var magnitude = Math.Sqrt(normA) * Math.Sqrt(normB);
        return magnitude == 0 ? 0 : dot / magnitude;
    }

    private record IndexedDocument(RagDocument Document, float[] Embedding)
    {
        public string DocumentId => Document.Id;
    }
}
