using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Application.Queries;

public class GetCalibrationRecordsQueryHandler
    : IRequestHandler<GetCalibrationRecordsQuery, Result<(IReadOnlyList<CalibrationRecordDto> Items, int TotalCount)>>
{
    private readonly ICalibrationRepository _repository;

    public GetCalibrationRecordsQueryHandler(ICalibrationRepository repository)
        => _repository = repository;

    public async Task<Result<(IReadOnlyList<CalibrationRecordDto> Items, int TotalCount)>> Handle(
        GetCalibrationRecordsQuery request, CancellationToken ct)
    {
        var result = await _repository.GetAllAsync(
            request.InstrumentId, request.Status, request.Page, request.PageSize, ct);

        return Result.Success((
            result.Items.Select(ToDto).ToList() as IReadOnlyList<CalibrationRecordDto>,
            result.TotalCount));
    }

    private static CalibrationRecordDto ToDto(CalibrationRecord r) => new(
        r.Id, r.InstrumentId, r.Instrument?.Name, r.CalibrationDate,
        r.NextDueDate, r.PerformedBy, r.PerformedByOrganization,
        r.CertificateRef, r.Status.ToString(), r.Notes);
}
