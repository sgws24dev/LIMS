using System.Text.Json;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Domain.ValueObjects;

namespace ResearchLms.AiServices.Infrastructure.Services.TalkToAction;

public class ActionOrchestrator : IActionOrchestrator
{
    private readonly ILlmService _llm;

    public ActionOrchestrator(ILlmService llm)
    {
        _llm = llm;
    }

    public async Task<ActionPlan> ParseIntentAsync(string utterance, Guid userId, CancellationToken ct = default)
    {
        var prompt = $@"You are an intent classifier for a laboratory management system.
Classify the user's request into one of these intents:
- BookInstrument: booking/reserving laboratory equipment
- CheckAvailability: checking when an instrument is free
- GetInstrumentStatus: checking instrument status
- CheckCompetencyStatus: checking training/competency
- SearchHelpdesk: searching helpdesk articles
- GeneralQuestion: general lab policy or procedure questions

Respond ONLY with a JSON object:
{{
  ""intent"": ""<intent>"",
  ""parameters"": {{ /* relevant parameters */ }},
  ""confidence"": <0.0-1.0>,
  ""suggestedTool"": ""<tool name or null>"",
  ""dryRunPreview"": ""<description of what would happen>""
}}

User request: {utterance}";

        var messages = new[]
        {
            new ChatMessage(ChatRole.System, "You are an intent classifier. Respond with JSON only."),
            new ChatMessage(ChatRole.User, prompt)
        };
        var config = new LlmConfig("llama3", 0.1, 500);

        var response = await _llm.ChatAsync(messages, config, ct);
        using var doc = JsonDocument.Parse(response);
        var root = doc.RootElement;

        return new ActionPlan(
            root.GetProperty("intent").GetString() ?? "GeneralQuestion",
            root.GetProperty("parameters").GetRawText(),
            root.GetProperty("confidence").GetDouble(),
            root.TryGetProperty("suggestedTool", out var tool) ? tool.GetString() : null,
            root.GetProperty("dryRunPreview").GetString() ?? "",
            root.GetProperty("confidence").GetDouble() < 0.7
        );
    }
}
