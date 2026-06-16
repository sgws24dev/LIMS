using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Domain.Exceptions;
using System.Net;
using System.Text.Json;

namespace ResearchLms.Scheduling.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred.");

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            switch (ex)
            {
                case ConstraintViolationException cve:
                    context.Response.StatusCode = (int)HttpStatusCode.UnprocessableEntity;
                    context.Response.ContentType = "application/json";
                    var unprocessable = new
                    {
                        success = false,
                        message = ex.Message,
                        violations = cve.Violations.Select(v => new
                        {
                            type = v.Type.ToString(),
                            v.Value,
                            v.Message
                        })
                    };
                    await context.Response.WriteAsync(JsonSerializer.Serialize(unprocessable, jsonOptions));
                    return;

                case NotFoundException:
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    break;

                case BookingConflictException:
                    context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                    break;

                case InvalidOperationException:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    break;

                case DuplicateWaitlistEntryException:
                    context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                    break;

                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    break;
            }

            context.Response.ContentType = "application/json";
            var response = ApiResponse.Fail(
                ex is DuplicateWaitlistEntryException ? ex.Message :
                ex.Message);
            var json = JsonSerializer.Serialize(response, jsonOptions);
            await context.Response.WriteAsync(json);
        }
    }
}
