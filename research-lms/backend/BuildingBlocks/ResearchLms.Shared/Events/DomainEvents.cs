using MediatR;

namespace ResearchLms.Shared.Events;

public record UserCreatedEvent(Guid UserId, string Email, string FullName, string[] Roles) : BaseEvent, INotification;

public record UserUpdatedEvent(Guid UserId, string Email, string FullName, string[] Roles) : BaseEvent, INotification;

public record UserDeletedEvent(Guid UserId, string Email) : BaseEvent, INotification;

public record RoleCreatedEvent(Guid RoleId, string Name, List<PermissionDto> Permissions) : BaseEvent, INotification;

public record RoleUpdatedEvent(Guid RoleId, string Name, List<PermissionDto> Permissions) : BaseEvent, INotification;

public record RoleDeletedEvent(Guid RoleId, string Name) : BaseEvent, INotification;
