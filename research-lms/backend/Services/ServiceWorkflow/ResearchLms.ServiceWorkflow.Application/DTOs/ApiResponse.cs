namespace ResearchLms.ServiceWorkflow.Application.DTOs;

public record ApiResponse<T>(bool Success, T? Data, string? Message = null);

public record PagedResponse<T>(
    bool Success,
    IReadOnlyList<T> Data,
    int TotalCount,
    int Page,
    int PageSize
);
