using MediatR;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public class CompleteMaintenanceRecordCommandHandler : IRequestHandler<CompleteMaintenanceRecordCommand, Result>
{
    private readonly IMaintenanceRepository _repository;

    public CompleteMaintenanceRecordCommandHandler(IMaintenanceRepository repository)
        => _repository = repository;

    public async Task<Result> Handle(CompleteMaintenanceRecordCommand request, CancellationToken ct)
    {
        var record = await _repository.GetByIdAsync(request.Id, ct);
        if (record is null)
            return Result.Failure("NOT_FOUND", "Maintenance record not found.");

        record.Complete(request.Data.CompletedDate, request.Data.Notes, request.Data.Cost);

        await _repository.UpdateAsync(record, ct);
        return Result.Success();
    }
}
