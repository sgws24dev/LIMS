using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Content.Domain.Entities;

public class PublicationInstrumentLink : BaseEntity
{
    public Guid PublicationId { get; private set; }
    public Guid InstrumentId { get; private set; }

    protected PublicationInstrumentLink() { }

    public PublicationInstrumentLink(Guid publicationId, Guid instrumentId)
    {
        PublicationId = publicationId;
        InstrumentId = instrumentId;
    }
}
