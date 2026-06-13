namespace ResearchLms.Shared.Events;

public record PermissionDto(string Module, bool CanView, bool CanCreate, bool CanEdit, bool CanDelete);
