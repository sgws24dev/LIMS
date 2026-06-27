using MediatR;
using ResearchLms.Compliance.Application.DTOs;
using ResearchLms.Compliance.Domain.Interfaces;

namespace ResearchLms.Compliance.Application.Queries;

public class GetAuditLogByIdQueryHandler : IRequestHandler<GetAuditLogByIdQuery, AuditLogEntryDto?>
{
    private readonly IAuditLogRepository _repository;

    public GetAuditLogByIdQueryHandler(IAuditLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<AuditLogEntryDto?> Handle(GetAuditLogByIdQuery request, CancellationToken ct)
    {
        var entry = await _repository.GetByIdAsync(request.Id, ct);
        if (entry == null) return null;

        return new AuditLogEntryDto
        {
            Id = entry.Id,
            EntityType = entry.EntityType,
            EntityId = entry.EntityId,
            Operation = entry.Operation,
            PreviousValues = entry.PreviousValues,
            NewValues = entry.NewValues,
            ChangedByUserId = entry.ChangedByUserId,
            ChangedByUserName = entry.ChangedByUserName,
            ChangeReason = entry.ChangeReason,
            IpAddress = entry.IpAddress,
            UserAgent = entry.UserAgent,
            Timestamp = entry.Timestamp,
            PreviousHash = entry.PreviousHash,
            CurrentHash = entry.CurrentHash,
        };
    }
}
