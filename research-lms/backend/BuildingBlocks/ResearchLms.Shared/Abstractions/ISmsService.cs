namespace ResearchLms.Shared.Abstractions;

public interface ISmsService
{
    Task SendAsync(string to, string body, CancellationToken ct = default);
}
