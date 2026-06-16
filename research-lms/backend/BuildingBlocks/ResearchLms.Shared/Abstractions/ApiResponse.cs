using System.Text.Json.Serialization;

namespace ResearchLms.Shared.Abstractions;

public class ApiResponse<T>
{
    public bool Success { get; }
    public T? Data { get; }
    public string? Error { get; }
    public int? TotalCount { get; }

    [JsonConstructor]
    public ApiResponse(bool success, T? data, string? error, int? totalCount)
    {
        Success = success;
        Data = data;
        Error = error;
        TotalCount = totalCount;
    }

    public static ApiResponse<T> Ok(T data, int? totalCount = null) =>
        new(true, data, null, totalCount);

    public static ApiResponse<T> Fail(string error) =>
        new(false, default, error, null);
}
