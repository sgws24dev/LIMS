using MediatR;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Application.Commands;

public class ConnectCalendarCommandHandler : IRequestHandler<ConnectCalendarCommand, Unit>
{
    private readonly ICalendarSyncService _syncService;

    public ConnectCalendarCommandHandler(ICalendarSyncService syncService)
        => _syncService = syncService;

    public async Task<Unit> Handle(ConnectCalendarCommand cmd, CancellationToken ct)
    {
        var connection = await _syncService.HandleCallbackAsync(
            cmd.Provider, cmd.AuthorizationCode,
            cmd.UserId.ToString(), cmd.TenantId, ct);

        await _syncService.SyncOutboundAsync(cmd.UserId, cmd.Provider, ct);
        await _syncService.SyncInboundAsync(cmd.UserId, cmd.Provider, ct);

        return Unit.Value;
    }
}

public class DisconnectCalendarCommandHandler : IRequestHandler<DisconnectCalendarCommand, Unit>
{
    private readonly ICalendarSyncService _syncService;

    public DisconnectCalendarCommandHandler(ICalendarSyncService syncService)
        => _syncService = syncService;

    public async Task<Unit> Handle(DisconnectCalendarCommand cmd, CancellationToken ct)
    {
        await _syncService.DisconnectAsync(cmd.UserId, cmd.Provider, ct);
        return Unit.Value;
    }
}

public class TriggerManualSyncCommandHandler : IRequestHandler<TriggerManualSyncCommand, Unit>
{
    private readonly ICalendarSyncService _syncService;

    public TriggerManualSyncCommandHandler(ICalendarSyncService syncService)
        => _syncService = syncService;

    public async Task<Unit> Handle(TriggerManualSyncCommand cmd, CancellationToken ct)
    {
        await _syncService.SyncBiDirectionalAsync(cmd.UserId, cmd.Provider, ct);
        return Unit.Value;
    }
}

public class AddTrainerAvailabilityCommandHandler : IRequestHandler<AddTrainerAvailabilityCommand, Guid>
{
    private readonly ITrainerAvailabilityRepository _repo;

    public AddTrainerAvailabilityCommandHandler(ITrainerAvailabilityRepository repo)
        => _repo = repo;

    public async Task<Guid> Handle(AddTrainerAvailabilityCommand cmd, CancellationToken ct)
    {
        var ta = new TrainerAvailability
        {
            TenantId = Guid.Empty,
            UserId = cmd.UserId,
            UserName = cmd.UserName,
            DayOfWeek = cmd.DayOfWeek,
            StartTime = cmd.StartTime,
            EndTime = cmd.EndTime,
            IsAvailable = cmd.IsAvailable,
            EffectiveFrom = cmd.EffectiveFrom ?? DateOnly.FromDateTime(DateTime.UtcNow),
            EffectiveTo = cmd.EffectiveTo,
            Source = AvailabilitySource.Manual,
            Notes = cmd.Notes
        };

        var result = await _repo.AddAsync(ta, ct);
        return result.Id;
    }
}

public class UpdateTrainerAvailabilityCommandHandler : IRequestHandler<UpdateTrainerAvailabilityCommand, Unit>
{
    private readonly ITrainerAvailabilityRepository _repo;

    public UpdateTrainerAvailabilityCommandHandler(ITrainerAvailabilityRepository repo)
        => _repo = repo;

    public async Task<Unit> Handle(UpdateTrainerAvailabilityCommand cmd, CancellationToken ct)
    {
        var ta = await _repo.GetByIdAsync(cmd.AvailabilityId, ct);
        if (ta is null)
            throw new KeyNotFoundException("Trainer availability not found.");

        ta.StartTime = cmd.StartTime;
        ta.EndTime = cmd.EndTime;
        ta.IsAvailable = cmd.IsAvailable;
        ta.EffectiveTo = cmd.EffectiveTo;
        ta.Notes = cmd.Notes;
        await _repo.UpdateAsync(ta, ct);

        return Unit.Value;
    }
}

public class DeleteTrainerAvailabilityCommandHandler : IRequestHandler<DeleteTrainerAvailabilityCommand, Unit>
{
    private readonly ITrainerAvailabilityRepository _repo;

    public DeleteTrainerAvailabilityCommandHandler(ITrainerAvailabilityRepository repo)
        => _repo = repo;

    public async Task<Unit> Handle(DeleteTrainerAvailabilityCommand cmd, CancellationToken ct)
    {
        await _repo.DeleteAsync(cmd.AvailabilityId, ct);
        return Unit.Value;
    }
}

public class SyncTrainerCalendarCommandHandler : IRequestHandler<SyncTrainerCalendarCommand, Unit>
{
    private readonly ITrainerSyncService _syncService;

    public SyncTrainerCalendarCommandHandler(ITrainerSyncService syncService)
        => _syncService = syncService;

    public async Task<Unit> Handle(SyncTrainerCalendarCommand cmd, CancellationToken ct)
    {
        await _syncService.SyncTrainerCalendarAsync(cmd.UserId, cmd.Provider, ct);
        return Unit.Value;
    }
}
