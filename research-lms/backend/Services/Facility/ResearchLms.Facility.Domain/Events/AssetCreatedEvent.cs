using MediatR;
using ResearchLms.Shared.Events;

namespace ResearchLms.Facilities.Domain.Events;

public record AssetCreatedEvent(Guid AssetId, Guid TenantId) : BaseEvent, INotification;
