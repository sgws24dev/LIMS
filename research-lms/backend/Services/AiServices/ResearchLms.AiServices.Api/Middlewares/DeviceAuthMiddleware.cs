using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Api.Middlewares;

public class DeviceAuthMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    };

    public DeviceAuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/api/v1/ai/iot/telemetry", StringComparison.OrdinalIgnoreCase)
            && context.Request.Method == HttpMethods.Post)
        {
            if (!context.Request.Headers.TryGetValue("X-Api-Key", out var apiKey) || string.IsNullOrWhiteSpace(apiKey))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = "Missing X-Api-Key header" }, JsonOpts));
                return;
            }

            using var scope = context.RequestServices.CreateScope();
            var keyRepo = scope.ServiceProvider.GetRequiredService<IInstrumentApiKeyRepository>();
            var tenantContext = scope.ServiceProvider.GetRequiredService<ITenantContext>();

            var keys = await keyRepo.GetByTenantAsync(tenantContext.TenantId);
            var matched = keys.FirstOrDefault(k => k.IsActive && !k.ExpiresAt.HasValue || k.ExpiresAt > DateTime.UtcNow);

            if (matched == null)
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = "Invalid API key" }, JsonOpts));
                return;
            }

            matched.MarkUsed();
            await keyRepo.UpdateAsync(matched);

            var claims = new[]
            {
                new Claim("device_id", matched.InstrumentId.ToString()),
                new Claim("api_key_id", matched.Id.ToString())
            };
            context.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "ApiKey"));
        }

        await _next(context);
    }
}
