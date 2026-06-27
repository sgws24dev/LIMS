using MediatR;
using ResearchLms.Compliance.Application.DTOs;
using ResearchLms.Compliance.Domain.Interfaces;

namespace ResearchLms.Compliance.Application.Queries;

public record GetChangeHistoryQuery(string EntityType, Guid EntityId) : IRequest<IReadOnlyList<AuditLogEntryDto>>;

public class GetChangeHistoryQueryHandler : IRequestHandler<GetChangeHistoryQuery, IReadOnlyList<AuditLogEntryDto>>
{
    private readonly IChangeTrackingService _changeTracking;

    public GetChangeHistoryQueryHandler(IChangeTrackingService changeTracking)
    {
        _changeTracking = changeTracking;
    }

    public async Task<IReadOnlyList<AuditLogEntryDto>> Handle(GetChangeHistoryQuery request, CancellationToken ct)
    {
        var entries = await _changeTracking.GetChangeHistoryAsync(request.EntityType, request.EntityId, ct);
        return entries.Select(e => new AuditLogEntryDto
        {
            Id = e.Id,
            EntityType = e.EntityType,
            EntityId = e.EntityId,
            Operation = e.Operation,
            PreviousValues = e.PreviousValues,
            NewValues = e.NewValues,
            ChangedByUserId = e.ChangedByUserId,
            ChangedByUserName = e.ChangedByUserName,
            ChangeReason = e.ChangeReason,
            Timestamp = e.Timestamp,
        }).ToList();
    }
}
