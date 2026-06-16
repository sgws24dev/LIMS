using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Queries;

public record GetMaintenanceRecordsQuery(
    Guid? AssetId, string? Status, DateOnly? DateFrom, DateOnly? DateTo,
    int Page = 1, int PageSize = 20) : IRequest<Result<(IReadOnlyList<MaintenanceRecordDto> Items, int TotalCount)>>;

public record GetMaintenanceCalendarQuery(int Month, int Year, Guid? FacilityId)
    : IRequest<Result<IEnumerable<MaintenanceCalendarEventDto>>>;

public record GetMaintenanceRecordByIdQuery(Guid Id) : IRequest<Result<MaintenanceRecordDto>>;

public record GetWorkOrdersQuery(Guid? MaintenanceRecordId, Guid? AssigneeId, string? Status, string? Priority)
    : IRequest<Result<IEnumerable<WorkOrderDto>>>;
