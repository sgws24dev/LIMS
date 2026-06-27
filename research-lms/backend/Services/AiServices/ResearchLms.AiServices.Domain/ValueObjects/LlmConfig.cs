namespace ResearchLms.AiServices.Domain.ValueObjects;

public record LlmConfig(
    string Model = "llama3.1:70b",
    double Temperature = 0.3,
    int MaxTokens = 4096,
    double TopP = 0.95
);
