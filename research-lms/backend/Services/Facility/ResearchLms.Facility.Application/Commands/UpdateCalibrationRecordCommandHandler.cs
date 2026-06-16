using MediatR;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public class UpdateCalibrationRecordCommandHandler : IRequestHandler<UpdateCalibrationRecordCommand, Result>
{
    private readonly ICalibrationRepository _repository;

    public UpdateCalibrationRecordCommandHandler(ICalibrationRepository repository)
        => _repository = repository;

    public async Task<Result> Handle(UpdateCalibrationRecordCommand request, CancellationToken ct)
    {
        var record = await _repository.GetByIdAsync(request.Id, ct);
        if (record is null)
            return Result.Failure("NOT_FOUND", "Calibration record not found.");

        record.Update(
            request.Data.CalibrationDate, request.Data.NextDueDate,
            request.Data.PerformedBy, request.Data.PerformedByOrganization,
            request.Data.CertificateRef, request.Data.Notes);

        await _repository.UpdateAsync(record, ct);
        return Result.Success();
    }
}
