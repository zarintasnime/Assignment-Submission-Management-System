using AssignmentManagement.Application.Common.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Middleware;

public sealed class GlobalExceptionMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            var (status, title, detail, errors) = MapException(exception);

            if (status >= StatusCodes.Status500InternalServerError)
            {
                logger.LogError(
                    exception,
                    "Unhandled exception. TraceId={TraceId}",
                    context.TraceIdentifier);
            }
            else
            {
                logger.LogWarning(
                    "Handled API error {Status}: {Message}. TraceId={TraceId}",
                    status,
                    exception.Message,
                    context.TraceIdentifier);
            }

            context.Response.StatusCode = status;
            context.Response.ContentType = "application/problem+json";

            var problem = new ProblemDetails
            {
                Status = status,
                Title = title,
                Detail = detail,
                Instance = context.Request.Path
            };

            problem.Extensions["traceId"] = context.TraceIdentifier;

            if (errors is not null)
            {
                problem.Extensions["errors"] = errors;
            }

            await context.Response.WriteAsJsonAsync(problem);
        }
    }

    private static (int Status, string Title, string Detail, object? Errors) MapException(
        Exception exception) =>
        exception switch
        {
            ValidationException validation =>
                (
                    StatusCodes.Status400BadRequest,
                    "Validation failed",
                    "One or more validation errors occurred.",
                    validation.Errors
                        .Select(error => new
                        {
                            error.PropertyName,
                            error.ErrorMessage
                        })
                        .ToArray()),

            UnauthorizedAppException =>
                (StatusCodes.Status401Unauthorized, "Unauthorized", exception.Message, null),

            ForbiddenException =>
                (StatusCodes.Status403Forbidden, "Forbidden", exception.Message, null),

            NotFoundException =>
                (StatusCodes.Status404NotFound, "Not Found", exception.Message, null),

            ConflictException =>
                (StatusCodes.Status409Conflict, "Conflict", exception.Message, null),

            BusinessRuleException =>
                (
                    StatusCodes.Status422UnprocessableEntity,
                    "Business Rule Violation",
                    exception.Message,
                    null),

            _ =>
                (
                    StatusCodes.Status500InternalServerError,
                    "Internal Server Error",
                    "An unexpected error occurred.",
                    null)
        };
}
