using System.Text.Json;
using System.Text.Json.Nodes;
using JsonSchemaNet = Json.Schema;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Domain.ValueObjects;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Services;

public class FormSchemaValidator : IFormSchemaValidator
{
    public ValidationResult Validate(JsonSchema schema, string formData)
    {
        try
        {
            var schemaText = schema.ToString();
            var jsonSchema = JsonSchemaNet.JsonSchema.FromText(schemaText);
            var jsonNode = JsonNode.Parse(formData);

            if (jsonNode == null)
                return new ValidationResult(false, new List<ValidationError>
                {
                    new("root", "Form data is not valid JSON.")
                });

            var result = jsonSchema.Evaluate(jsonNode, new JsonSchemaNet.EvaluationOptions
            {
                OutputFormat = JsonSchemaNet.OutputFormat.List
            });

            if (result.IsValid)
                return new ValidationResult(true);

            var errors = new List<ValidationError>();
            foreach (var detail in result.Details ?? Enumerable.Empty<JsonSchemaNet.EvaluationResults>())
            {
                if (!detail.IsValid && detail.Errors != null)
                {
                    foreach (var kvp in detail.Errors)
                    {
                        var field = kvp.Key.TrimStart('#', '/');
                        errors.Add(new ValidationError(string.IsNullOrEmpty(field) ? "root" : field, kvp.Value));
                    }
                }
            }

            if (errors.Count == 0 && result.Errors != null)
            {
                foreach (var kvp in result.Errors)
                {
                    var field = kvp.Key.TrimStart('#', '/');
                    errors.Add(new ValidationError(string.IsNullOrEmpty(field) ? "root" : field, kvp.Value));
                }
            }

            return new ValidationResult(false, errors);
        }
        catch (JsonException ex)
        {
            return new ValidationResult(false, new List<ValidationError>
            {
                new("root", $"Invalid JSON: {ex.Message}")
            });
        }
    }
}
