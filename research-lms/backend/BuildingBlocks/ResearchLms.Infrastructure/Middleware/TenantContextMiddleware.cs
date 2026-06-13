using Microsoft.AspNetCore.Http;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Infrastructure.Middleware;

public class TenantContextMiddleware
{
    private readonly RequestDelegate _next;

    public TenantContextMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext)
    {
        var tenantId = context.Request.Headers["X-Tenant-Id"].FirstOrDefault()
                       ?? context.Request.Host.Host.Split('.')[0];

        if (Guid.TryParse(tenantId, out var tid))
            tenantContext.SetTenant(tid, tenantId);
        else
            tenantContext.SetTenant(Guid.Empty, "default");

        await _next(context);
    }
}
