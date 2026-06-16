using MediatR;
using ResearchLms.Scheduling.Application.Commands;
using ResearchLms.Scheduling.Domain.Exceptions;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Application.Handlers;

public class JoinWaitlistCommandHandler : IRequestHandler<JoinWaitlistCommand, Guid>
{
    private readonly IWaitlistService _service;

    public JoinWaitlistCommandHandler(IWaitlistService service) => _service = service;

    public async Task<Guid> Handle(JoinWaitlistCommand request, CancellationToken ct) =>
        await _service.JoinAsync(
            request.ResourceId, request.ResourceType,
            request.RequestedDate, request.RequestedStartTime,
            request.RequestedEndTime, request.UserId, request.UserName,
            request.Notes, ct);
}

public class LeaveWaitlistCommandHandler : IRequestHandler<LeaveWaitlistCommand, Unit>
{
    private readonly IWaitlistRepository _repo;

    public LeaveWaitlistCommandHandler(IWaitlistRepository repo) => _repo = repo;

    public async Task<Unit> Handle(LeaveWaitlistCommand request, CancellationToken ct)
    {
        var entry = await _repo.GetByIdAsync(request.EntryId, ct);
        if (entry is null) throw new NotFoundException("Waitlist entry not found.");
        if (entry.UserId != request.UserId)
            throw new InvalidOperationException("You can only cancel your own waitlist entries.");

        entry.Status = Domain.Enums.WaitlistStatus.Cancelled;
        await _repo.UpdateAsync(entry, ct);
        return Unit.Value;
    }
}
