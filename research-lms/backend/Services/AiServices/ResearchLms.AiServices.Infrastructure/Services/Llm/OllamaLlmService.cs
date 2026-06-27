using System.Net.Http.Json;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Infrastructure.Services.Llm;

public class OllamaLlmService : ILlmService
{
    private readonly HttpClient _httpClient;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public OllamaLlmService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string> ChatAsync(ChatMessage[] messages, LlmConfig config, CancellationToken ct)
    {
        var request = new
        {
            model = config.Model,
            messages = messages.Select(m => new { role = m.Role.ToString().ToLower(), content = m.Content }),
            stream = false,
            options = new { temperature = config.Temperature, num_predict = config.MaxTokens, top_p = config.TopP }
        };

        var response = await _httpClient.PostAsync(
            "api/chat",
            new StringContent(JsonSerializer.Serialize(request, JsonOpts), Encoding.UTF8, "application/json"),
            ct);

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<OllamaChatResponse>(JsonOpts, ct);
        return json?.Message?.Content ?? string.Empty;
    }

    public async IAsyncEnumerable<string> StreamChatAsync(ChatMessage[] messages, LlmConfig config, [EnumeratorCancellation] CancellationToken ct)
    {
        var request = new
        {
            model = config.Model,
            messages = messages.Select(m => new { role = m.Role.ToString().ToLower(), content = m.Content }),
            stream = true,
            options = new { temperature = config.Temperature, num_predict = config.MaxTokens, top_p = config.TopP }
        };

        var httpRequest = new HttpRequestMessage(HttpMethod.Post, "api/chat")
        {
            Content = new StringContent(JsonSerializer.Serialize(request, JsonOpts), Encoding.UTF8, "application/json")
        };

        using var response = await _httpClient.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead, ct);
        response.EnsureSuccessStatusCode();

        using var stream = await response.Content.ReadAsStreamAsync(ct);
        using var reader = new StreamReader(stream);

        while (!ct.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync(ct);
            if (line == null) break;
            if (string.IsNullOrWhiteSpace(line)) continue;

            var chunk = JsonSerializer.Deserialize<OllamaStreamChunk>(line, JsonOpts);
            if (chunk?.Message?.Content != null)
                yield return chunk.Message.Content;
        }
    }

    public async Task<float[]> GenerateEmbeddingsAsync(string text, CancellationToken ct)
    {
        var request = new { model = "nomic-embed-text", prompt = text };
        var response = await _httpClient.PostAsync(
            "api/embeddings",
            new StringContent(JsonSerializer.Serialize(request, JsonOpts), Encoding.UTF8, "application/json"),
            ct);

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<OllamaEmbeddingResponse>(JsonOpts, ct);
        return json?.Embedding ?? Array.Empty<float>();
    }

    private class OllamaChatResponse
    {
        public OllamaMessage? Message { get; set; }
    }

    private class OllamaMessage
    {
        public string? Content { get; set; }
    }

    private class OllamaStreamChunk
    {
        public OllamaMessage? Message { get; set; }
        public bool Done { get; set; }
    }

    private class OllamaEmbeddingResponse
    {
        public float[]? Embedding { get; set; }
    }
}
