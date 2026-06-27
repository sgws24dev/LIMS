using System.Text.Json;
using ResearchLms.Billing.Domain.ValueObjects;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Domain.Entities;

public class ReportDefinition : BaseEntity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string SourceEntity { get; private set; }
    public string FieldsJson { get; private set; }
    public string FiltersJson { get; private set; }

    private ReportDefinition() { Name = null!; SourceEntity = null!; FieldsJson = null!; FiltersJson = null!; }

    public ReportDefinition(string name, string? description, string sourceEntity, List<ReportField> fields, List<ReportFilter> filters, string createdBy)
    {
        Name = name;
        Description = description;
        SourceEntity = sourceEntity;
        FieldsJson = JsonSerializer.Serialize(fields);
        FiltersJson = JsonSerializer.Serialize(filters);
        MarkCreated(createdBy);
    }

    public List<ReportField> GetFields() =>
        JsonSerializer.Deserialize<List<ReportField>>(FieldsJson) ?? new List<ReportField>();

    public List<ReportFilter> GetFilters() =>
        JsonSerializer.Deserialize<List<ReportFilter>>(FiltersJson) ?? new List<ReportFilter>();

    public void Update(string name, string? description, string sourceEntity, List<ReportField> fields, List<ReportFilter> filters, string modifiedBy)
    {
        Name = name;
        Description = description;
        SourceEntity = sourceEntity;
        FieldsJson = JsonSerializer.Serialize(fields);
        FiltersJson = JsonSerializer.Serialize(filters);
        MarkUpdated(modifiedBy);
    }
}
