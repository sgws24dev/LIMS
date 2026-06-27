using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Content.Domain.Entities;

public class HelpArticle : BaseEntity
{
    public string Title { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string Content { get; private set; } = string.Empty;
    public Guid CategoryId { get; private set; }
    public string TagsJson { get; private set; } = "[]";
    public bool IsPublished { get; private set; }
    public int ViewCount { get; private set; }

    protected HelpArticle() { }

    public HelpArticle(string title, string slug, string content, Guid categoryId, string[] tags, bool isPublished)
    {
        Title = title;
        Slug = slug;
        Content = content;
        CategoryId = categoryId;
        TagsJson = System.Text.Json.JsonSerializer.Serialize(tags);
        IsPublished = isPublished;
        ViewCount = 0;
    }

    public string[] GetTags()
    {
        return System.Text.Json.JsonSerializer.Deserialize<string[]>(TagsJson) ?? Array.Empty<string>();
    }

    public void Update(string title, string slug, string content, Guid categoryId, string[] tags, bool isPublished)
    {
        Title = title;
        Slug = slug;
        Content = content;
        CategoryId = categoryId;
        TagsJson = System.Text.Json.JsonSerializer.Serialize(tags);
        IsPublished = isPublished;
    }

    public void IncrementViewCount()
    {
        ViewCount++;
    }

    public void Publish() => IsPublished = true;
    public void Unpublish() => IsPublished = false;
}
