using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ResearchLms.AiServices.Infrastructure.Services.Mcp;

public class McpHostedService : BackgroundService
{
    private readonly McpServer _mcpServer;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<McpHostedService> _logger;
    private readonly ConcurrentDictionary<string, SseClient> _clients = new();

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public McpHostedService(McpServer mcpServer, IServiceScopeFactory scopeFactory, ILogger<McpHostedService> logger)
    {
        _mcpServer = mcpServer;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public string AddClient(Stream outputStream, CancellationToken ct)
    {
        var clientId = Guid.NewGuid().ToString();
        _clients[clientId] = new SseClient(outputStream, ct);
        _logger.LogInformation("MCP SSE client {ClientId} connected", clientId);
        return clientId;
    }

    public void RemoveClient(string clientId)
    {
        _clients.TryRemove(clientId, out _);
        _logger.LogInformation("MCP SSE client {ClientId} disconnected", clientId);
    }

    public async Task SendToolsListAsync(string clientId, CancellationToken ct)
    {
        if (!_clients.TryGetValue(clientId, out var client)) return;

        var tools = _mcpServer.ListTools().Select(t => new
        {
            name = t.Name,
            description = t.Description,
            inputSchema = t.InputSchema
        });

        var data = JsonSerializer.Serialize(new { type = "tools_list", tools }, JsonOpts);
        await client.WriteAsync($"event: message\ndata: {data}\n\n", ct);
    }

    public async Task ExecuteToolAsync(string clientId, string toolName, JsonElement input, Guid userId, CancellationToken ct)
    {
        if (!_clients.TryGetValue(clientId, out var client)) return;

        var result = await _mcpServer.ExecuteAsync(toolName, input, userId, ct);
        var data = JsonSerializer.Serialize(new
        {
            type = "tool_result",
            tool = toolName,
            success = result.Success,
            result = result.Result
        }, JsonOpts);

        await client.WriteAsync($"event: message\ndata: {data}\n\n", ct);
    }

    public async Task BroadcastToolsUpdateAsync(CancellationToken ct)
    {
        var tools = _mcpServer.ListTools().Select(t => new
        {
            name = t.Name,
            description = t.Description,
            inputSchema = t.InputSchema
        });

        var data = JsonSerializer.Serialize(new { type = "tools_updated", tools }, JsonOpts);
        var message = $"event: message\ndata: {data}\n\n";

        foreach (var (id, client) in _clients)
        {
            try
            {
                await client.WriteAsync(message, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send to MCP SSE client {ClientId}", id);
            }
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("MCP Hosted Service started");
        try
        {
            await Task.Delay(Timeout.Infinite, stoppingToken);
        }
        catch (OperationCanceledException) { }
    }
}

public class SseClient
{
    private readonly Stream _stream;
    private readonly CancellationToken _ct;
    private readonly SemaphoreSlim _lock = new(1, 1);

    public SseClient(Stream stream, CancellationToken ct)
    {
        _stream = stream;
        _ct = ct;
    }

    public async Task WriteAsync(string message, CancellationToken ct)
    {
        using var linked = CancellationTokenSource.CreateLinkedTokenSource(_ct, ct);
        await _lock.WaitAsync(linked.Token);
        try
        {
            var bytes = System.Text.Encoding.UTF8.GetBytes(message);
            await _stream.WriteAsync(bytes, linked.Token);
            await _stream.FlushAsync(linked.Token);
        }
        finally
        {
            _lock.Release();
        }
    }
}
