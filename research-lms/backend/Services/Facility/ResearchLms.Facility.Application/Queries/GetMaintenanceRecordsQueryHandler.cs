using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Application.Queries;

public class GetMaintenanceRecordsQueryHandler
    : IRequestHandler<GetMaintenanceRecordsQuery, Result<(IReadOnlyList<MaintenanceRecordDto> Items, int TotalCount)>>
{
    private readonly IMaintenanceRepository _repository;

    public GetMaintenanceRecordsQueryHandler(IMaintenanceRepository repository)
        => _repository = repository;

    public async Task<Result<(IReadOnlyList<MaintenanceRecordDto> Items, int TotalCount)>> Handle(
        GetMaintenanceRecordsQuery request, CancellationToken ct)
    {
        var result = await _repository.GetAllAsync(
            request.AssetId, request.Status, request.DateFrom, request.DateTo,
            request.Page, request.PageSize, ct);

        return Result.Success((
            result.Items.Select(ToDto).ToList() as IReadOnlyList<MaintenanceRecordDto>,
            result.TotalCount));
    }

    private static MaintenanceRecordDto ToDto(MaintenanceRecord r) => new(
        r.Id, r.AssetId, r.Asset?.Name ?? "", r.Type.ToString(),
        r.ScheduledDate, r.CompletedDate, r.Status.ToString(),
        r.TechnicianName, r.Cost);
}
