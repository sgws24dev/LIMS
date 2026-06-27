using ResearchLms.Content.Domain.Enums;
using ResearchLms.Shared.Abstractions;
using System.Text.Json;

namespace ResearchLms.Content.Domain.Entities;

public class Publication : BaseEntity
{
    public string Title { get; private set; } = string.Empty;
    public string AuthorsJson { get; private set; } = "[]";
    public string? Journal { get; private set; }
    public string? Doi { get; private set; }
    public string? PmId { get; private set; }
    public DateTime? PublicationDate { get; private set; }
    public PublicationType Type { get; private set; }
    public string? Link { get; private set; }
    public string? Abstract { get; private set; }
    public string AttachmentsJson { get; private set; } = "[]";
    public bool IsVerified { get; private set; }

    protected Publication() { }

    public Publication(
        string title,
        string[] authors,
        string? journal,
        string? doi,
        string? pmId,
        DateTime? publicationDate,
        PublicationType type,
        string? link,
        string? abstractText,
        bool isVerified)
    {
        Title = title;
        AuthorsJson = JsonSerializer.Serialize(authors);
        Journal = journal;
        Doi = doi;
        PmId = pmId;
        PublicationDate = publicationDate;
        Type = type;
        Link = link;
        Abstract = abstractText;
        IsVerified = isVerified;
    }

    public string[] GetAuthors() =>
        JsonSerializer.Deserialize<string[]>(AuthorsJson) ?? Array.Empty<string>();

    public string[] GetAttachments() =>
        string.IsNullOrEmpty(AttachmentsJson)
            ? Array.Empty<string>()
            : JsonSerializer.Deserialize<string[]>(AttachmentsJson) ?? Array.Empty<string>();

    public void Update(
        string title,
        string[] authors,
        string? journal,
        string? doi,
        string? pmId,
        DateTime? publicationDate,
        PublicationType type,
        string? link,
        string? abstractText,
        bool isVerified)
    {
        Title = title;
        AuthorsJson = JsonSerializer.Serialize(authors);
        Journal = journal;
        Doi = doi;
        PmId = pmId;
        PublicationDate = publicationDate;
        Type = type;
        Link = link;
        Abstract = abstractText;
        IsVerified = isVerified;
    }

    public void Verify() => IsVerified = true;

    public void AddAttachment(string fileRef)
    {
        var attachments = GetAttachments().ToList();
        attachments.Add(fileRef);
        AttachmentsJson = JsonSerializer.Serialize(attachments);
    }
}
