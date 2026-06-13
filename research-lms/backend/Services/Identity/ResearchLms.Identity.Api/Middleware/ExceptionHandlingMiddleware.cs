using System.Net;
using System.Text.Json;
using ResearchLms.Shared.Exceptions;

namespace ResearchLms.Identity.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (DomainException ex)
        {
            _logger.LogWarning(ex, "Domain exception");
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.ContentType = "application/json";
            var error = new { error = ex.Code, message = ex.Message };
            await context.Response.WriteAsync(JsonSerializer.Serialize(error));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access");
            context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
            context.Response.ContentType = "application/json";
            var error = new { error = "FORBIDDEN", message = "Access denied." };
            await context.Response.WriteAsync(JsonSerializer.Serialize(error));
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found");
            context.Response.StatusCode = (int)HttpStatusCode.NotFound;
            context.Response.ContentType = "application/json";
            var error = new { error = "NOT_FOUND", message = ex.Message };
            await context.Response.WriteAsync(JsonSerializer.Serialize(error));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";
            var error = new { error = "INTERNAL_ERROR", message = "An unexpected error occurred." };
            await context.Response.WriteAsync(JsonSerializer.Serialize(error));
        }
    }
}