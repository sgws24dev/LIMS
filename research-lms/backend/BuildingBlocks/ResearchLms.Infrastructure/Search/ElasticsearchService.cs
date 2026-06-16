using Nest;

namespace ResearchLms.Infrastructure.Search;

public interface ISearchService
{
    Task IndexAsync<T>(string indexName, T document) where T : class;
    Task<IReadOnlyList<T>> SearchAsync<T>(string indexName, string query) where T : class;
    Task DeleteIndexAsync(string indexName);
}

public class ElasticsearchService : ISearchService
{
    private readonly IElasticClient _client;

    public ElasticsearchService(IElasticClient client)
    {
        _client = client;
    }

    public async Task IndexAsync<T>(string indexName, T document) where T : class
    {
        var exists = await _client.Indices.ExistsAsync(indexName);
        if (!exists.Exists)
            await _client.Indices.CreateAsync(indexName, c => c
                .Map(m => m.AutoMap<T>()));

        await _client.IndexAsync(document, i => i.Index(indexName));
    }

    public async Task<IReadOnlyList<T>> SearchAsync<T>(string indexName, string query) where T : class
    {
        var response = await _client.SearchAsync<T>(s => s
            .Index(indexName)
            .Query(q => q
                .QueryString(qs => qs
                    .Query(query))));

        if (!response.IsValid)
            return [];

        return response.Documents.ToList().AsReadOnly();
    }

    public async Task DeleteIndexAsync(string indexName)
    {
        var exists = await _client.Indices.ExistsAsync(indexName);
        if (exists.Exists)
            await _client.Indices.DeleteAsync(indexName);
    }
}
