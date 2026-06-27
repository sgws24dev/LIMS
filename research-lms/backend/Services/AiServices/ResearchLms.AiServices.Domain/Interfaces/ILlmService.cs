using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface ILlmService
{
    Task<string> ChatAsync(ChatMessage[] messages, LlmConfig config, CancellationToken ct = default);
    IAsyncEnumerable<string> StreamChatAsync(ChatMessage[] messages, LlmConfig config, CancellationToken ct = default);
    Task<float[]> GenerateEmbeddingsAsync(string text, CancellationToken ct = default);
}
