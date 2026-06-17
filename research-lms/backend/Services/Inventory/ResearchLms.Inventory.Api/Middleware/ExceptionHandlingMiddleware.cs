using System.Net;
using System.Text.Json;
using ResearchLms.Inventory.Domain.Interfaces;

namespace ResearchLms.Inventory.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var code = HttpStatusCode.InternalServerError;
        object response;

        switch (exception)
        {
            case KeyNotFoundException:
                code = HttpStatusCode.NotFound;
                response = new { success = false, message = exception.Message };
                break;

            case DuplicateKeyException:
                code = HttpStatusCode.Conflict;
                response = new { success = false, message = exception.Message };
                break;

            case InvalidOperationException:
                code = HttpStatusCode.BadRequest;
                response = new { success = false, message = exception.Message };
                break;

            case ArgumentException:
                code = HttpStatusCode.BadRequest;
                response = new { success = false, message = exception.Message };
                break;

            default:
                response = new { success = false, message = "An internal error occurred." };
                break;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)code;

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
