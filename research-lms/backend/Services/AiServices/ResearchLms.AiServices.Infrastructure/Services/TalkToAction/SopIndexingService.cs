using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.AiServices.Domain.ValueObjects;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Infrastructure.Services.TalkToAction;

public interface ISopIndexingService
{
    Task IndexSopAsync(string title, string content, Guid instrumentId, CancellationToken ct = default);
    Task<IReadOnlyList<RagResult>> SearchSopsAsync(string query, Guid? instrumentId = null, CancellationToken ct = default);
}

public class SopIndexingService : ISopIndexingService
{
    private readonly IRagService _rag;
    private readonly ITenantContext _tenantContext;

    public SopIndexingService(IRagService rag, ITenantContext tenantContext)
    {
        _rag = rag;
        _tenantContext = tenantContext;
    }

    public async Task IndexSopAsync(string title, string content, Guid instrumentId, CancellationToken ct = default)
    {
        var doc = new RagDocument(
            $"sop-{Guid.NewGuid()}",
            title,
            content,
            SourceType.Sop,
            null,
            instrumentId,
            _tenantContext.TenantId
        );
        await _rag.IndexDocumentAsync(doc, ct);
    }

    public async Task<IReadOnlyList<RagResult>> SearchSopsAsync(string query, Guid? instrumentId = null, CancellationToken ct = default)
    {
        var results = await _rag.SearchAsync(query, 5, instrumentId, _tenantContext.TenantId, ct);
        return results;
    }
}
