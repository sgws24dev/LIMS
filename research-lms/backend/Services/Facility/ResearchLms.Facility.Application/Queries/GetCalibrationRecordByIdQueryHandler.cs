using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Application.Queries;

public class GetCalibrationRecordByIdQueryHandler
    : IRequestHandler<GetCalibrationRecordByIdQuery, Result<CalibrationRecordDto>>
{
    private readonly ICalibrationRepository _repository;

    public GetCalibrationRecordByIdQueryHandler(ICalibrationRepository repository)
        => _repository = repository;

    public async Task<Result<CalibrationRecordDto>> Handle(
        GetCalibrationRecordByIdQuery request, CancellationToken ct)
    {
        var record = await _repository.GetByIdAsync(request.Id, ct);
        if (record is null)
            return Result.Failure<CalibrationRecordDto>("NOT_FOUND", "Calibration record not found.");

        return Result.Success(ToDto(record));
    }

    private static CalibrationRecordDto ToDto(CalibrationRecord r) => new(
        r.Id, r.InstrumentId, r.Instrument?.Name, r.CalibrationDate,
        r.NextDueDate, r.PerformedBy, r.PerformedByOrganization,
        r.CertificateRef, r.Status.ToString(), r.Notes);
}
