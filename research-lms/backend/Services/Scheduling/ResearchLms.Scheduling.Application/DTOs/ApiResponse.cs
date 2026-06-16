namespace ResearchLms.Scheduling.Application.DTOs;

public class ApiResponse
{
    public bool Succeeded { get; }
    public object? Data { get; }
    public string? Error { get; }
    public int? TotalCount { get; }

    public ApiResponse(bool succeeded, object? data, string? error, int? totalCount)
    {
        Succeeded = succeeded;
        Data = data;
        Error = error;
        TotalCount = totalCount;
    }

    public static ApiResponse Ok(object? data = null, int? totalCount = null) =>
        new(true, data, null, totalCount);

    public static ApiResponse Fail(string error) =>
        new(false, null, error, null);
}
