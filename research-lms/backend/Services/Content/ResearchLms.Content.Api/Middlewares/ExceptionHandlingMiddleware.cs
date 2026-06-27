using System.Net;
using System.Text.Json;

namespace ResearchLms.Content.Api.Middlewares;

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
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found");
            context.Response.StatusCode = (int)HttpStatusCode.NotFound;
            await WriteError(context, "Not Found", ex.Message);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Bad request");
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            await WriteError(context, "Bad Request", ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            await WriteError(context, "Internal Server Error", "An unexpected error occurred.");
        }
    }

    private static async Task WriteError(HttpContext context, string title, string detail)
    {
        context.Response.ContentType = "application/problem+json";
        var problem = new
        {
            type = "https://tools.ietf.org/html/rfc7231",
            title,
            status = context.Response.StatusCode,
            detail
        };
        await context.Response.WriteAsync(JsonSerializer.Serialize(problem));
    }
}
