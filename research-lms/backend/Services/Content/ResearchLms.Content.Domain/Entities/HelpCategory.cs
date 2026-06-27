using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Content.Domain.Entities;

public class HelpCategory : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public int SortOrder { get; private set; }
    public Guid? ParentCategoryId { get; private set; }

    protected HelpCategory() { }

    public HelpCategory(string name, string slug, int sortOrder, Guid? parentCategoryId)
    {
        Name = name;
        Slug = slug;
        SortOrder = sortOrder;
        ParentCategoryId = parentCategoryId;
    }

    public void Update(string name, string slug, int sortOrder, Guid? parentCategoryId)
    {
        Name = name;
        Slug = slug;
        SortOrder = sortOrder;
        ParentCategoryId = parentCategoryId;
    }
}
