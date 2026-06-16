using System.Text.Json;

namespace ResearchLms.ServiceWorkflow.Domain.ValueObjects;

public sealed record JsonSchema
{
    public string Schema { get; init; }

    public JsonSchema(string schema)
    {
        if (string.IsNullOrWhiteSpace(schema))
            throw new ArgumentException("Schema cannot be empty", nameof(schema));

        using var doc = JsonDocument.Parse(schema);
        Schema = schema;
    }

    public JsonElement Root => JsonDocument.Parse(Schema).RootElement.Clone();

    public static implicit operator string(JsonSchema schema) => schema.Schema;

    public static explicit operator JsonSchema(string value) => new(value);

    public override string ToString() => Schema;
}
