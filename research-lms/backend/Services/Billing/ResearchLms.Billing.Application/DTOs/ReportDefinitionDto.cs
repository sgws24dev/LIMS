namespace ResearchLms.Billing.Application.DTOs;

public class ReportDefinitionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string SourceEntity { get; set; } = string.Empty;
    public string FieldsJson { get; set; } = string.Empty;
    public string FiltersJson { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateReportDefinitionDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string SourceEntity { get; set; } = string.Empty;
    public string FieldsJson { get; set; } = string.Empty;
    public string FiltersJson { get; set; } = string.Empty;
}

public class UpdateReportDefinitionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string SourceEntity { get; set; } = string.Empty;
    public string FieldsJson { get; set; } = string.Empty;
    public string FiltersJson { get; set; } = string.Empty;
}
