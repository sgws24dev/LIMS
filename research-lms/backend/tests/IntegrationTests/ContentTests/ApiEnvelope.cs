namespace ResearchLms.IntegrationTests.ContentTests;

public record ApiEnvelope<T>(bool Success, T? Data, string? Error, int? TotalCount);