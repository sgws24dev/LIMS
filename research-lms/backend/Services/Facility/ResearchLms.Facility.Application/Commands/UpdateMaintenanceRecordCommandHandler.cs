using MediatR;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Application.Commands;

public class UpdateMaintenanceRecordCommandHandler : IRequestHandler<UpdateMaintenanceRecordCommand, Result>
{
    private readonly IMaintenanceRepository _repository;

    public UpdateMaintenanceRecordCommandHandler(IMaintenanceRepository repository)
        => _repository = repository;

    public async Task<Result> Handle(UpdateMaintenanceRecordCommand request, CancellationToken ct)
    {
        var record = await _repository.GetByIdAsync(request.Id, ct);
        if (record is null)
            return Result.Failure("NOT_FOUND", "Maintenance record not found.");

        var type = Enum.Parse<MaintenanceType>(request.Data.Type);
        record.Update(type, request.Data.ScheduledDate, request.Data.Description, request.Data.Notes, request.Data.Cost);

        await _repository.UpdateAsync(record, ct);
        return Result.Success();
    }
}
