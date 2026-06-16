using ResearchLms.ServiceWorkflow.Domain.ValueObjects;

namespace ResearchLms.ServiceWorkflow.Domain.Interfaces;

public interface IFormSchemaValidator
{
    ValidationResult Validate(JsonSchema schema, string formData);
}

public record ValidationResult(bool IsValid, IReadOnlyList<ValidationError>? Errors = null);

public record ValidationError(string Field, string Message);
