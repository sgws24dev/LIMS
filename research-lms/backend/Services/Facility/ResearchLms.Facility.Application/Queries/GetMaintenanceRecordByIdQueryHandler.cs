using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Application.Queries;

public class GetMaintenanceRecordByIdQueryHandler
    : IRequestHandler<GetMaintenanceRecordByIdQuery, Result<MaintenanceRecordDto>>
{
    private readonly IMaintenanceRepository _repository;

    public GetMaintenanceRecordByIdQueryHandler(IMaintenanceRepository repository)
        => _repository = repository;

    public async Task<Result<MaintenanceRecordDto>> Handle(
        GetMaintenanceRecordByIdQuery request, CancellationToken ct)
    {
        var record = await _repository.GetByIdAsync(request.Id, ct);
        if (record is null)
            return Result.Failure<MaintenanceRecordDto>("NOT_FOUND", "Maintenance record not found.");

        return Result.Success(ToDto(record));
    }

    private static MaintenanceRecordDto ToDto(MaintenanceRecord r) => new(
        r.Id, r.AssetId, r.Asset?.Name ?? "", r.Type.ToString(),
        r.ScheduledDate, r.CompletedDate, r.Status.ToString(),
        r.TechnicianName, r.Cost);
}
