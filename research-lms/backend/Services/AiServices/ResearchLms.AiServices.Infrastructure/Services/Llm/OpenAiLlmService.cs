using System.Net.Http.Json;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Infrastructure.Services.Llm;

public class OpenAiLlmService : ILlmService
{
    private readonly HttpClient _httpClient;
    private readonly string _model;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public OpenAiLlmService(HttpClient httpClient, string model = "gpt-4o")
    {
        _httpClient = httpClient;
        _model = model;
    }

    public async Task<string> ChatAsync(ChatMessage[] messages, LlmConfig config, CancellationToken ct)
    {
        var request = new
        {
            model = _model,
            messages = messages.Select(m => new { role = m.Role.ToString().ToLower(), content = m.Content }),
            temperature = config.Temperature,
            max_tokens = config.MaxTokens,
            top_p = config.TopP
        };

        var response = await _httpClient.PostAsync(
            "v1/chat/completions",
            new StringContent(JsonSerializer.Serialize(request, JsonOpts), Encoding.UTF8, "application/json"),
            ct);

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<OpenAiChatResponse>(JsonOpts, ct);
        return json?.Choices?.FirstOrDefault()?.Message?.Content ?? string.Empty;
    }

    public async IAsyncEnumerable<string> StreamChatAsync(ChatMessage[] messages, LlmConfig config, [EnumeratorCancellation] CancellationToken ct)
    {
        var request = new
        {
            model = _model,
            messages = messages.Select(m => new { role = m.Role.ToString().ToLower(), content = m.Content }),
            stream = true,
            temperature = config.Temperature,
            max_tokens = config.MaxTokens,
            top_p = config.TopP
        };

        var httpRequest = new HttpRequestMessage(HttpMethod.Post, "v1/chat/completions")
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
            if (!line.StartsWith("data: ")) continue;

            var data = line[6..];
            if (data == "[DONE]") break;

            var chunk = JsonSerializer.Deserialize<OpenAiStreamChunk>(data, JsonOpts);
            var content = chunk?.Choices?.FirstOrDefault()?.Delta?.Content;
            if (!string.IsNullOrEmpty(content))
                yield return content;
        }
    }

    public async Task<float[]> GenerateEmbeddingsAsync(string text, CancellationToken ct)
    {
        var request = new { model = "text-embedding-3-small", input = text };
        var response = await _httpClient.PostAsync(
            "v1/embeddings",
            new StringContent(JsonSerializer.Serialize(request, JsonOpts), Encoding.UTF8, "application/json"),
            ct);

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<OpenAiEmbeddingResponse>(JsonOpts, ct);
        return json?.Data?.FirstOrDefault()?.Embedding ?? Array.Empty<float>();
    }

    private class OpenAiChatResponse
    {
        public OpenAiChoice[]? Choices { get; set; }
    }

    private class OpenAiChoice
    {
        public OpenAiMessage? Message { get; set; }
    }

    private class OpenAiMessage
    {
        public string? Content { get; set; }
    }

    private class OpenAiStreamChunk
    {
        public OpenAiStreamChoice[]? Choices { get; set; }
    }

    private class OpenAiStreamChoice
    {
        public OpenAiStreamDelta? Delta { get; set; }
    }

    private class OpenAiStreamDelta
    {
        public string? Content { get; set; }
    }

    private class OpenAiEmbeddingResponse
    {
        public OpenAiEmbeddingData[]? Data { get; set; }
    }

    private class OpenAiEmbeddingData
    {
        public float[]? Embedding { get; set; }
    }
}
