using ResearchLms.Content.Application.DTOs;
using ResearchLms.Content.Application.Services;
using System.Net.Http.Json;
using System.Text.Json;

namespace ResearchLms.Content.Infrastructure.Services;

public class CrossRefDoiService : IDoiService
{
    private readonly HttpClient _httpClient;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public CrossRefDoiService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<CreatePublicationRequest?> LookupDoiAsync(string doi, CancellationToken ct)
    {
        try
        {
            var response = await _httpClient.GetAsync(
                $"https://api.crossref.org/works/{doi}",
                HttpCompletionOption.ResponseHeadersRead, ct);

            if (!response.IsSuccessStatusCode) return null;

            var json = await response.Content.ReadFromJsonAsync<CrossRefResponse>(JsonOpts, ct);
            if (json?.Message == null) return null;

            var msg = json.Message;
            var title = msg.Title?.FirstOrDefault() ?? "Untitled";
            var authors = msg.Author?.Select(a =>
            {
                var name = string.Join(" ", new[] { a.Given, a.Family }.Where(s => !string.IsNullOrEmpty(s)));
                return string.IsNullOrEmpty(name) ? "Unknown" : name;
            }).ToArray() ?? Array.Empty<string>();

            DateTime? parsedDate = null;
            if (msg.PublishedDateParts?.DateParts?.FirstOrDefault() is { } parts && parts.Length >= 1)
            {
                var year = parts[0];
                var month = parts.Length > 1 ? parts[1] : 1;
                var day = parts.Length > 2 ? parts[2] : 1;
                if (DateTime.TryParse($"{year:D4}-{month:D2}-{day:D2}", out var dt))
                    parsedDate = dt;
            }

            return new CreatePublicationRequest(
                title,
                authors,
                msg.ContainerTitle?.FirstOrDefault() ?? msg.Publisher,
                doi,
                null,
                parsedDate,
                "ResearchPaper",
                msg.Url,
                msg.Abstract,
                false,
                null
            );
        }
        catch
        {
            return null;
        }
    }

    private class CrossRefResponse
    {
        public CrossRefMessage? Message { get; set; }
    }

    private class CrossRefMessage
    {
        public string[]? Title { get; set; }
        public CrossRefAuthor[]? Author { get; set; }
        public string? Publisher { get; set; }
        public string[]? ContainerTitle { get; set; }
        public string? Abstract { get; set; }
        public string? Url { get; set; }
        public CrossRefDate? PublishedDateParts { get; set; }
    }

    private class CrossRefAuthor
    {
        public string? Given { get; set; }
        public string? Family { get; set; }
    }

    private class CrossRefDate
    {
        public int[][]? DateParts { get; set; }
    }
}