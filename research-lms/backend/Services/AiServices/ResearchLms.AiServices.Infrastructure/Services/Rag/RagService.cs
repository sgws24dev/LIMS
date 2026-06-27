using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Infrastructure.Services.Rag;

public class RagService : IRagService
{
    private readonly ILlmService _llmService;
    private readonly IVectorSearchService _vectorSearch;

    public RagService(ILlmService llmService, IVectorSearchService vectorSearch)
    {
        _llmService = llmService;
        _vectorSearch = vectorSearch;
    }

    public async Task IndexDocumentAsync(RagDocument document, CancellationToken ct)
    {
        var chunks = ChunkText(document.Content, 512, 64);

        for (int i = 0; i < chunks.Length; i++)
        {
            var chunkDoc = document with
            {
                Id = $"{document.Id}_chunk_{i}",
                Content = chunks[i]
            };

            var embedding = await _llmService.GenerateEmbeddingsAsync(chunks[i], ct);
            await _vectorSearch.IndexDocumentAsync(chunkDoc, embedding, ct);
        }
    }

    public async Task<RagResult[]> SearchAsync(string query, int topK, Guid? instrumentId, Guid? tenantId, CancellationToken ct)
    {
        var queryEmbedding = await _llmService.GenerateEmbeddingsAsync(query, ct);
        return await _vectorSearch.SearchAsync(queryEmbedding, topK, instrumentId, tenantId, ct);
    }

    public async Task RemoveDocumentAsync(string documentId, CancellationToken ct)
    {
        await _vectorSearch.RemoveDocumentAsync(documentId, ct);
    }

    private static string[] ChunkText(string text, int chunkSize, int overlap)
    {
        if (string.IsNullOrEmpty(text))
            return Array.Empty<string>();

        var words = text.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (words.Length <= chunkSize)
            return new[] { text };

        var chunks = new List<string>();
        int start = 0;
        while (start < words.Length)
        {
            var end = Math.Min(start + chunkSize, words.Length);
            chunks.Add(string.Join(" ", words[start..end]));
            start = end - overlap;
            if (start >= words.Length || start >= end) break;
        }

        return chunks.ToArray();
    }
}
