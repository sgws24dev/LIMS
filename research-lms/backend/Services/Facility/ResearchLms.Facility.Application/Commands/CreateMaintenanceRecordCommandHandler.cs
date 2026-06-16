using MediatR;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Shared.Domain;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Application.Commands;

public class CreateMaintenanceRecordCommandHandler : IRequestHandler<CreateMaintenanceRecordCommand, Result<Guid>>
{
    private readonly IMaintenanceRepository _repository;

    public CreateMaintenanceRecordCommandHandler(IMaintenanceRepository repository)
        => _repository = repository;

    public async Task<Result<Guid>> Handle(CreateMaintenanceRecordCommand request, CancellationToken ct)
    {
        var type = Enum.Parse<MaintenanceType>(request.Data.Type);
        var record = new MaintenanceRecord(
            request.Data.AssetId, type, request.Data.ScheduledDate,
            request.Data.Description, request.Data.Notes, request.Data.Cost,
            request.Data.TechnicianName);

        await _repository.AddAsync(record, ct);
        return Result.Success(record.Id);
    }
}
