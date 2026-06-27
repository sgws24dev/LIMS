using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Domain.ValueObjects;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Infrastructure.Services.Helpdesk;

public class HelpdeskHub : Hub
{
    private readonly IHelpdeskConversationRepository _conversationRepo;
    private readonly ILlmService _llmService;
    private readonly ITenantContext _tenant;
    private readonly ICurrentUser _currentUser;

    public HelpdeskHub(
        IHelpdeskConversationRepository conversationRepo,
        ILlmService llmService,
        ITenantContext tenant,
        ICurrentUser currentUser)
    {
        _conversationRepo = conversationRepo;
        _llmService = llmService;
        _tenant = tenant;
        _currentUser = currentUser;
    }

    public override async Task OnConnectedAsync()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant_{_tenant.TenantId}");
        await base.OnConnectedAsync();
    }

    public async Task SendMessage(Guid conversationId, string message)
    {
        var conversation = await _conversationRepo.GetByIdAsync(conversationId);
        if (conversation == null)
        {
            await Clients.Caller.SendAsync("Error", "Conversation not found");
            return;
        }

        var userMsg = new HelpdeskMessage(conversationId, ChatRole.User, message);
        userMsg.SetTenant(_tenant.TenantId);
        userMsg.MarkCreated(_currentUser.Name);
        conversation.AddMessage(userMsg);

        var messages = conversation.Messages.Select(m => new ChatMessage(m.Role, m.Content)).ToArray();
        var fullResponse = new List<string>();
        var config = new LlmConfig();

        await foreach (var token in _llmService.StreamChatAsync(messages, config))
        {
            fullResponse.Add(token);
            await Clients.Caller.SendAsync("ReceiveToken", token);
        }

        var assistantContent = string.Concat(fullResponse);
        var assistantMsg = new HelpdeskMessage(conversationId, ChatRole.Assistant, assistantContent, assistantContent.Length / 4);
        assistantMsg.SetTenant(_tenant.TenantId);
        assistantMsg.MarkCreated("ai");
        conversation.AddMessage(assistantMsg);

        await _conversationRepo.UpdateAsync(conversation);
        await Clients.Caller.SendAsync("MessageComplete", new { conversationId, tokensUsed = assistantMsg.TokensUsed });
    }

    public async Task<string> StartConversation(string topic)
    {
        var conversation = new HelpdeskConversation(_currentUser.UserId, topic);
        conversation.SetTenant(_tenant.TenantId);
        conversation.MarkCreated(_currentUser.Name);
        await _conversationRepo.AddAsync(conversation);
        return conversation.Id.ToString();
    }

    public async Task<string?> GetHistory(Guid conversationId)
    {
        var conversation = await _conversationRepo.GetByIdAsync(conversationId);
        if (conversation == null) return null;

        var history = conversation.Messages.Select(m => new
        {
            id = m.Id.ToString(),
            role = m.Role.ToString().ToLower(),
            content = m.Content,
            createdAt = m.CreatedAt
        });

        return JsonSerializer.Serialize(history);
    }
}
