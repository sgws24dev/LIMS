using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Billing.Domain.Entities;

public class DashboardDefinition : BaseEntity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string Layout { get; private set; }
    public bool IsDefault { get; private set; }
    public bool IsShared { get; private set; }
    public string? SharedWith { get; private set; }
    public Guid CreatedByUserId { get; private set; }

    private readonly List<DashboardWidget> _widgets = new();
    public IReadOnlyCollection<DashboardWidget> Widgets => _widgets.AsReadOnly();

    private DashboardDefinition() { Name = null!; Layout = null!; }

    public DashboardDefinition(
        string name,
        string? description,
        string layout,
        bool isDefault,
        Guid createdByUserId,
        string createdBy)
    {
        Name = name;
        Description = description;
        Layout = layout;
        IsDefault = isDefault;
        IsShared = false;
        CreatedByUserId = createdByUserId;
        MarkCreated(createdBy);
    }

    public void UpdateDetails(string name, string? description, string layout, bool isDefault, string modifiedBy)
    {
        Name = name;
        Description = description;
        Layout = layout;
        IsDefault = isDefault;
        MarkUpdated(modifiedBy);
    }

    public void SetSharedWith(string? sharedWith, string modifiedBy)
    {
        IsShared = !string.IsNullOrEmpty(sharedWith);
        SharedWith = sharedWith;
        MarkUpdated(modifiedBy);
    }

    public void AddWidget(DashboardWidget widget)
    {
        _widgets.Add(widget);
    }

    public void RemoveWidget(Guid widgetId)
    {
        var widget = _widgets.FirstOrDefault(w => w.Id == widgetId);
        if (widget != null)
            _widgets.Remove(widget);
    }

    public void ClearWidgets()
    {
        _widgets.Clear();
    }
}
