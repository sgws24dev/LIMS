using ResearchLms.Content.Application.DTOs;

namespace ResearchLms.Content.Application.Services;

public interface IDoiService
{
    Task<CreatePublicationRequest?> LookupDoiAsync(string doi, CancellationToken ct = default);
}