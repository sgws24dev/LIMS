using MediatR;
using ResearchLms.Compliance.Application.DTOs;
using ResearchLms.Compliance.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Compliance.Application.Queries;

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, (IReadOnlyList<AuditLogEntryDto> Items, int TotalCount)>
{
    private readonly IAuditLogRepository _repository;

    public GetAuditLogsQueryHandler(IAuditLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<(IReadOnlyList<AuditLogEntryDto> Items, int TotalCount)> Handle(GetAuditLogsQuery request, CancellationToken ct)
    {
        var items = await _repository.GetAllAsync(request.EntityType, request.EntityId, request.UserId, request.DateFrom, request.DateTo, request.Operation, request.Page, request.PageSize, ct);
        var total = await _repository.CountAsync(request.EntityType, request.EntityId, request.UserId, request.DateFrom, request.DateTo, request.Operation, ct);

        var dtos = items.Select(e => new AuditLogEntryDto
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
            IpAddress = e.IpAddress,
            UserAgent = e.UserAgent,
            Timestamp = e.Timestamp,
            PreviousHash = e.PreviousHash,
            CurrentHash = e.CurrentHash,
        }).ToList();

        return (dtos, total);
    }
}
