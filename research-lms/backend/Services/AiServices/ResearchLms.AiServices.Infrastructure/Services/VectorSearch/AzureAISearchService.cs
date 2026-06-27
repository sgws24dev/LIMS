using Azure;
using Azure.Search.Documents;
using Azure.Search.Documents.Indexes;
using Azure.Search.Documents.Indexes.Models;
using Azure.Search.Documents.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Infrastructure.Services.VectorSearch;

public class AzureAISearchService : IVectorSearchService
{
    private readonly SearchIndexClient _indexClient;
    private readonly SearchClient _searchClient;
    private readonly ILogger<AzureAISearchService> _logger;
    private const string IndexName = "rag-documents";
    private bool _indexEnsured;

    public AzureAISearchService(IConfiguration configuration, ILogger<AzureAISearchService> logger)
    {
        _logger = logger;
        var endpoint = configuration["Ai:VectorDb:Azure:Endpoint"]
            ?? throw new InvalidOperationException("Azure AI Search endpoint not configured");
        var apiKey = configuration["Ai:VectorDb:Azure:ApiKey"]
            ?? throw new InvalidOperationException("Azure AI Search API key not configured");

        var credential = new AzureKeyCredential(apiKey);
        _indexClient = new SearchIndexClient(new Uri(endpoint), credential);
        _searchClient = _indexClient.GetSearchClient(IndexName);
    }

    public async Task IndexDocumentAsync(RagDocument document, float[] embedding, CancellationToken ct = default)
    {
        try
        {
            await EnsureIndexAsync(ct);

            var doc = new SearchDocument
            {
                ["id"] = document.Id,
                ["title"] = document.Title,
                ["content"] = document.Content,
                ["sourceType"] = document.SourceType.ToString(),
                ["sourceUrl"] = document.SourceUrl ?? string.Empty,
                ["instrumentId"] = document.InstrumentId?.ToString() ?? string.Empty,
                ["tenantId"] = document.TenantId.ToString(),
                ["embedding"] = embedding
            };

            await _searchClient.IndexDocumentsAsync(
                IndexDocumentsBatch.MergeOrUpload(new[] { doc }),
                new IndexDocumentsOptions(),
                ct);

            _logger.LogInformation("Indexed document {DocumentId} in Azure AI Search", document.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to index document {DocumentId}", document.Id);
            throw;
        }
    }

    public async Task<RagResult[]> SearchAsync(float[] queryEmbedding, int topK = 5, Guid? instrumentId = null, Guid? tenantId = null, CancellationToken ct = default)
    {
        try
        {
            var vectorQuery = new VectorizedQuery(queryEmbedding)
            {
                KNearestNeighborsCount = topK,
                Fields = { "embedding" }
            };

            var filterParts = new List<string>();
            if (tenantId.HasValue)
                filterParts.Add($"tenantId eq '{tenantId.Value}'");
            if (instrumentId.HasValue)
                filterParts.Add($"instrumentId eq '{instrumentId.Value}'");

            var options = new SearchOptions
            {
                VectorSearch = new VectorSearchOptions { Queries = { vectorQuery } },
                Size = topK,
                Filter = filterParts.Count > 0 ? string.Join(" and ", filterParts) : null,
                IncludeTotalCount = false
            };

            var response = await _searchClient.SearchAsync<SearchDocument>("*", options, ct);
            var results = new List<RagResult>();

            await foreach (var result in response.Value.GetResultsAsync())
            {
                var doc = result.Document;
                var content = doc.TryGetValue("content", out var c) ? c?.ToString() ?? "" : "";
                var title = doc.TryGetValue("title", out var t) ? t?.ToString() ?? "" : "";
                var sourceType = doc.TryGetValue("sourceType", out var st) ? st?.ToString() ?? "" : "";
                var sourceUrl = doc.TryGetValue("sourceUrl", out var su) ? su?.ToString() ?? "" : "";

                results.Add(new RagResult(
                    content,
                    result.Score ?? 0,
                    title,
                    $"sourceType={sourceType}, sourceUrl={sourceUrl}"
                ));
            }

            return results.ToArray();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Azure AI Search query failed");
            throw;
        }
    }

    public async Task RemoveDocumentAsync(string documentId, CancellationToken ct = default)
    {
        try
        {
            await _searchClient.DeleteDocumentsAsync("id", new[] { documentId }, new IndexDocumentsOptions(), ct);
            _logger.LogInformation("Removed document {DocumentId} from Azure AI Search", documentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to remove document {DocumentId}", documentId);
            throw;
        }
    }

    private async Task EnsureIndexAsync(CancellationToken ct)
    {
        if (_indexEnsured) return;

        try
        {
            await _indexClient.GetIndexAsync(IndexName, ct);
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            var index = new SearchIndex(IndexName)
            {
                Fields =
                {
                    new SimpleField("id", SearchFieldDataType.String) { IsKey = true },
                    new SearchableField("title") { IsFilterable = true },
                    new SearchableField("content"),
                    new SimpleField("sourceType", SearchFieldDataType.String) { IsFilterable = true, IsFacetable = true },
                    new SimpleField("sourceUrl", SearchFieldDataType.String) { IsFilterable = true },
                    new SimpleField("instrumentId", SearchFieldDataType.String) { IsFilterable = true },
                    new SimpleField("tenantId", SearchFieldDataType.String) { IsFilterable = true },
                    new VectorSearchField("embedding", 1536, "default-profile")
                },
                VectorSearch = new Azure.Search.Documents.Indexes.Models.VectorSearch
                {
                    Profiles =
                    {
                        new VectorSearchProfile("default-profile", "default-config")
                    },
                    Algorithms =
                    {
                        new HnswAlgorithmConfiguration("default-config")
                    }
                }
            };

            await _indexClient.CreateIndexAsync(index, ct);
            _logger.LogInformation("Created Azure AI Search index {IndexName}", IndexName);
        }

        _indexEnsured = true;
    }
}
