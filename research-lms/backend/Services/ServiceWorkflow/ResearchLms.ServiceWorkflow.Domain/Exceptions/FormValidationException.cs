namespace ResearchLms.ServiceWorkflow.Domain.Exceptions;

public class FormValidationException : Exception
{
    public IReadOnlyList<FieldError> FieldErrors { get; }

    public FormValidationException(string message, IEnumerable<FieldError> fieldErrors)
        : base(message)
    {
        FieldErrors = fieldErrors.ToList().AsReadOnly();
    }
}

public record FieldError(string Field, string Message);
