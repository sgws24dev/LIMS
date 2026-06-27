using System.Diagnostics;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Infrastructure.Services.Mcp;

public class McpServer
{
    private readonly ToolRegistry _registry;
    private readonly IServiceScopeFactory _scopeFactory;

    public McpServer(ToolRegistry registry, IServiceScopeFactory scopeFactory)
    {
        _registry = registry;
        _scopeFactory = scopeFactory;
    }

    public IReadOnlyList<McpToolDefinition> ListTools() => _registry.GetAll();

    public async Task<McpExecutionResult> ExecuteAsync(string toolName, JsonElement input, Guid userId, CancellationToken ct)
    {
        var tool = _registry.Get(toolName);
        if (tool == null)
            return new McpExecutionResult(false, JsonSerializer.SerializeToElement(new { error = $"Tool '{toolName}' not found" }));

        var sw = Stopwatch.StartNew();
        bool isError = false;
        JsonElement result;

        try
        {
            result = await tool.Handler(input);
        }
        catch (Exception ex)
        {
            isError = true;
            result = JsonSerializer.SerializeToElement(new { error = ex.Message });
        }

        sw.Stop();

        using (var scope = _scopeFactory.CreateScope())
        {
            var logRepo = scope.ServiceProvider.GetRequiredService<IMcpToolLogRepository>();
            var tenant = scope.ServiceProvider.GetRequiredService<ITenantContext>();

            var log = new McpToolLog(toolName, input.ToString(), result.ToString(), userId, sw.ElapsedMilliseconds, isError);
            log.SetTenant(tenant.TenantId);
            log.MarkCreated("system");
            await logRepo.AddAsync(log, ct);
        }

        return new McpExecutionResult(!isError, result);
    }
}

public record McpExecutionResult(bool Success, JsonElement Result);
