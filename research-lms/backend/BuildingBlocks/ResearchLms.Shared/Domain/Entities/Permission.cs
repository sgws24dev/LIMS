using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Shared.Domain.Entities;

public sealed class Permission : BaseEntity
{
    private Permission() { }

    public Permission(string module, bool canView, bool canCreate, bool canEdit, bool canDelete)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(module);

        Module = module;
        CanView = canView;
        CanCreate = canCreate;
        CanEdit = canEdit;
        CanDelete = canDelete;
    }

    public string Module { get; private set; } = string.Empty;
    public bool CanView { get; private set; }
    public bool CanCreate { get; private set; }
    public bool CanEdit { get; private set; }
    public bool CanDelete { get; private set; }
}
