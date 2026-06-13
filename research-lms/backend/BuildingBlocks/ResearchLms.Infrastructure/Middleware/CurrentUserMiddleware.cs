using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using ResearchLms.Infrastructure.Contexts;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Infrastructure.Middleware;

public class CurrentUserMiddleware
{
    private readonly RequestDelegate _next;

    public CurrentUserMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, ICurrentUser currentUser)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userId = Guid.Parse(context.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var email = context.User.FindFirstValue(ClaimTypes.Email)!;
            var name = context.User.Identity.Name ?? email;
            var roles = context.User.Claims
                .Where(c => c.Type == ClaimTypes.Role)
                .Select(c => c.Value)
                .ToArray();
            var tenantId = Guid.Parse(context.User.FindFirstValue("tenant_id")!);

            if (currentUser is CurrentUser cu)
            {
                cu.SetUser(userId, email, name, roles, tenantId);
            }
        }

        await _next(context);
    }
}
