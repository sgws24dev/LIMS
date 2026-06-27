using MediatR;
using ResearchLms.Compliance.Application.DTOs;

namespace ResearchLms.Compliance.Application.Queries;

public record GetAuditLogsQuery(
    string? EntityType, Guid? EntityId, string? UserId,
    DateTime? DateFrom, DateTime? DateTo, string? Operation,
    int Page = 1, int PageSize = 50
) : IRequest<(IReadOnlyList<AuditLogEntryDto> Items, int TotalCount)>;
