using System.Collections.Concurrent;

namespace ResearchLms.Infrastructure.Search;

public interface ISearchService
{
    Task IndexAsync<T>(string indexName, T document) where T : class;
    Task<IReadOnlyList<T>> SearchAsync<T>(string indexName, string query) where T : class;
    Task DeleteIndexAsync(string indexName);
}

public class SearchService : ISearchService
{
    private readonly ConcurrentDictionary<string, object> _store = new();
    private long _counter;

    public Task IndexAsync<T>(string indexName, T document) where T : class
    {
        var key = $"{indexName}:{Interlocked.Increment(ref _counter)}";
        _store[key] = document;
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<T>> SearchAsync<T>(string indexName, string query) where T : class
    {
        var results = _store
            .Where(kv => kv.Key.StartsWith(indexName + ":"))
            .Select(kv => kv.Value)
            .OfType<T>()
            .Where(d => d.ToString()?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false)
            .ToList()
            .AsReadOnly();

        return Task.FromResult<IReadOnlyList<T>>(results);
    }

    public Task DeleteIndexAsync(string indexName)
    {
        var keys = _store.Keys.Where(k => k.StartsWith(indexName + ":")).ToList();
        foreach (var key in keys)
            _store.TryRemove(key, out _);
        return Task.CompletedTask;
    }
}
