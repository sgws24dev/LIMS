using System.Net;
using System.Text.Json;
using ResearchLms.Training.Domain.Exceptions;

namespace ResearchLms.Training.Api.Middleware;

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
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found");
            context.Response.StatusCode = (int)HttpStatusCode.NotFound;
            context.Response.ContentType = "application/json";
            var result = JsonSerializer.Serialize(new { success = false, error = ex.Message });
            await context.Response.WriteAsync(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";
            var result = JsonSerializer.Serialize(new { success = false, error = "An internal server error occurred." });
            await context.Response.WriteAsync(result);
        }
    }
}
