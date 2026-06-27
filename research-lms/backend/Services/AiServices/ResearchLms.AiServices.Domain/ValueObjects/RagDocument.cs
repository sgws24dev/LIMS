namespace ResearchLms.AiServices.Domain.ValueObjects;

public enum SourceType
{
    Sop,
    HelpArticle,
    Manual,
    Generic
}

public record RagDocument(
    string Id,
    string Title,
    string Content,
    SourceType SourceType,
    string? SourceUrl,
    Guid? InstrumentId,
    Guid TenantId
);

public record RagResult(
    string ChunkContent,
    double Score,
    string Source,
    string Metadata
);
