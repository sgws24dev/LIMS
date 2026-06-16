using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Application.DTOs;

public record ConstraintDto(
    Guid Id,
    Guid ResourceId,
    string ResourceName,
    ConstraintType Type,
    string Value,
    string? Description,
    string? ErrorMessage,
    bool IsActive
);

public record CreateConstraintRequest(
    Guid ResourceId,
    ResourceType ResourceType,
    ConstraintType Type,
    string Value,
    string? Description,
    string? ErrorMessage
);

public record UpdateConstraintRequest(
    string Value,
    string? Description,
    string? ErrorMessage,
    bool IsActive
);

public record ConstraintEvaluationResultDto(
    bool IsSatisfied,
    IEnumerable<ConstraintViolationDto> Violations
);

public record ConstraintViolationDto(
    string Type,
    string Value,
    string Message
);
