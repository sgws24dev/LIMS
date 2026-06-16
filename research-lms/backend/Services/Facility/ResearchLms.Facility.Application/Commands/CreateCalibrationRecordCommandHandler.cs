using MediatR;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Application.Commands;

public class CreateCalibrationRecordCommandHandler : IRequestHandler<CreateCalibrationRecordCommand, Result<Guid>>
{
    private readonly ICalibrationRepository _repository;

    public CreateCalibrationRecordCommandHandler(ICalibrationRepository repository)
        => _repository = repository;

    public async Task<Result<Guid>> Handle(CreateCalibrationRecordCommand request, CancellationToken ct)
    {
        var record = new CalibrationRecord(
            request.Data.InstrumentId, request.Data.CalibrationDate, request.Data.NextDueDate,
            request.Data.PerformedBy, request.Data.PerformedByOrganization,
            request.Data.CertificateRef, request.Data.Notes);

        await _repository.AddAsync(record, ct);
        return Result.Success(record.Id);
    }
}
