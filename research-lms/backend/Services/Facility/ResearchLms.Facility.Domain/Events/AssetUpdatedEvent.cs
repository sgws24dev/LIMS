using MediatR;
using ResearchLms.Shared.Events;

namespace ResearchLms.Facilities.Domain.Events;

public record AssetUpdatedEvent(Guid AssetId, Guid TenantId) : BaseEvent, INotification;
