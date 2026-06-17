namespace ResearchLms.ServiceWorkflow.Application.DTOs;

public record FormDefinitionDto(
    Guid Id,
    string Title,
    string? Description,
    string Schema,
    string Fields,
    int Version,
    string Status,
    string Category,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy
);

public record CreateFormDefinitionRequest(
    string Title,
    string? Description,
    string Schema,
    string Fields,
    string Category
);

public record UpdateFormDefinitionRequest(
    string Title,
    string? Description,
    string Schema,
    string Fields,
    string Category
);
