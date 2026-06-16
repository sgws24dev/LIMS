using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Application.Queries;

public class GetMaintenanceCalendarQueryHandler
    : IRequestHandler<GetMaintenanceCalendarQuery, Result<IEnumerable<MaintenanceCalendarEventDto>>>
{
    private readonly IMaintenanceRepository _repository;

    public GetMaintenanceCalendarQueryHandler(IMaintenanceRepository repository)
        => _repository = repository;

    public async Task<Result<IEnumerable<MaintenanceCalendarEventDto>>> Handle(
        GetMaintenanceCalendarQuery request, CancellationToken ct)
    {
        var records = await _repository.GetCalendarAsync(request.Month, request.Year, request.FacilityId, ct);
        var dtos = records.Select(r =>
        {
            var color = r.Status switch
            {
                MaintenanceStatus.Scheduled => "#3b82f6",
                MaintenanceStatus.InProgress => "#f59e0b",
                MaintenanceStatus.Completed => "#22c55e",
                MaintenanceStatus.Overdue => "#ef4444",
                MaintenanceStatus.Cancelled => "#6b7280",
                _ => "#3b82f6"
            };
            return new MaintenanceCalendarEventDto(
                r.Id, $"{r.Asset?.Name} - {r.Type}", r.ScheduledDate,
                r.Status.ToString(), r.AssetId, color);
        });
        return Result.Success(dtos);
    }
}
