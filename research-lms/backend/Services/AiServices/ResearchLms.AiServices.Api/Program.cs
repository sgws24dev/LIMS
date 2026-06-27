using System.Text.Encodings.Web;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ResearchLms.AiServices.Api.Middlewares;
using ResearchLms.AiServices.Application;
using ResearchLms.AiServices.Infrastructure;
using ResearchLms.AiServices.Infrastructure.Persistence;
using ResearchLms.AiServices.Infrastructure.Services.Helpdesk;
using ResearchLms.AiServices.Infrastructure.Services.Iot;
using ResearchLms.AiServices.Infrastructure.Services.Mcp;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using ResearchLms.Shared.Abstractions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSignalR();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Jwt:Authority"];
        options.Audience = builder.Configuration["Jwt:Audience"];
    });

builder.Services.AddAuthorization();

builder.Services.AddAiServicesApplication();
builder.Services.AddAiServicesInfrastructure(builder.Configuration);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AiServicesDbContext>();
    var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
    if (env != "Testing" && context.Database.IsRelational())
        await context.Database.MigrateAsync();
    else
        await context.Database.EnsureCreatedAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<DeviceAuthMiddleware>();
app.MapControllers();
app.MapHub<HelpdeskHub>("/hubs/helpdesk");
app.MapHub<IoTDataHub>("/hubs/telemetry");

app.MapGet("/mcp/sse", async (HttpContext context, McpHostedService mcpHosted, ICurrentUser currentUser) =>
{
    if (!currentUser.IsAuthenticated)
    {
        context.Response.StatusCode = 401;
        return;
    }

    context.Response.ContentType = "text/event-stream";
    context.Response.Headers.CacheControl = "no-cache";
    context.Response.Headers.Connection = "keep-alive";

    var clientId = mcpHosted.AddClient(context.Response.Body, context.RequestAborted);
    var endpointUrl = $"{context.Request.Scheme}://{context.Request.Host}/mcp/messages?clientId={clientId}";
    var endpointData = JsonSerializer.Serialize(new { endpoint = endpointUrl }, new JsonSerializerOptions
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    });
    await context.Response.WriteAsync($"event: endpoint\ndata: {endpointData}\n\n", context.RequestAborted);
    await context.Response.Body.FlushAsync(context.RequestAborted);

    await mcpHosted.SendToolsListAsync(clientId, context.RequestAborted);

    try
    {
        await Task.Delay(Timeout.Infinite, context.RequestAborted);
    }
    catch (OperationCanceledException) { }
    finally
    {
        mcpHosted.RemoveClient(clientId);
    }
});

app.MapPost("/mcp/messages", async (HttpContext context, McpHostedService mcpHosted, ICurrentUser currentUser) =>
{
    var clientId = context.Request.Query["clientId"].FirstOrDefault();
    if (string.IsNullOrEmpty(clientId))
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsync("Missing clientId query parameter");
        return;
    }

    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    using var doc = JsonDocument.Parse(body);
    var root = doc.RootElement;

    var type = root.GetProperty("type").GetString();
    switch (type)
    {
        case "get_tools":
            await mcpHosted.SendToolsListAsync(clientId, context.RequestAborted);
            break;
        case "execute_tool":
            var toolName = root.GetProperty("tool").GetString()!;
            var input = root.TryGetProperty("input", out var inp) ? inp : JsonSerializer.SerializeToElement(new { });
            var userId = currentUser.UserId;
            await mcpHosted.ExecuteToolAsync(clientId, toolName, input, userId, context.RequestAborted);
            break;
        default:
            context.Response.StatusCode = 400;
            await context.Response.WriteAsync($"Unknown message type: {type}");
            break;
    }
});

app.Run();

public partial class AiServicesProgram { }
