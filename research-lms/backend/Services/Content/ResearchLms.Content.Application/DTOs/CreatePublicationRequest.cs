namespace ResearchLms.Content.Application.DTOs;

public record CreatePublicationRequest(
    string Title,
    string[] Authors,
    string? Journal,
    string? Doi,
    string? PmId,
    DateTime? PublicationDate,
    string Type,
    string? Link,
    string? Abstract,
    bool IsVerified,
    List<Guid>? InstrumentIds
);
