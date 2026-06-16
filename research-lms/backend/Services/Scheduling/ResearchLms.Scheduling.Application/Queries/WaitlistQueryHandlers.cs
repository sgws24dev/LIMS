using MediatR;
using ResearchLms.Scheduling.Application.DTOs;
using ResearchLms.Scheduling.Domain.Enums;
using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Application.Queries;

public class GetWaitlistQueryHandler : IRequestHandler<GetWaitlistQuery, (IEnumerable<WaitlistEntryDto> Items, int TotalCount)>
{
    private readonly IWaitlistRepository _repo;
    private readonly IBookingResourceRepository _resourceRepo;
    private readonly IWaitlistService _waitlistService;

    public GetWaitlistQueryHandler(
        IWaitlistRepository repo,
        IBookingResourceRepository resourceRepo,
        IWaitlistService waitlistService)
    {
        _repo = repo;
        _resourceRepo = resourceRepo;
        _waitlistService = waitlistService;
    }

    public async Task<(IEnumerable<WaitlistEntryDto> Items, int TotalCount)> Handle(
        GetWaitlistQuery request, CancellationToken ct)
    {
        var status = request.Status != null
            ? (WaitlistStatus?)Enum.Parse<WaitlistStatus>(request.Status.Value.ToString())
            : null;

        var (items, total) = await _repo.GetPagedAsync(
            request.UserId, request.ResourceId, status, request.Page, request.PageSize, ct);

        var dtos = new List<WaitlistEntryDto>();
        foreach (var entry in items)
        {
            var resource = await _resourceRepo.GetByResourceIdAsync(entry.ResourceId, ct);
            var position = await _waitlistService.GetPositionAsync(entry.Id, ct);
            dtos.Add(new WaitlistEntryDto(
                entry.Id, entry.ResourceId, resource?.Name ?? "Unknown",
                entry.ResourceType, entry.RequestedDate,
                entry.RequestedStartTime, entry.RequestedEndTime,
                position, entry.Status, entry.PromotedAt,
                entry.ExpiresAt, entry.ProvisionalBookingId, entry.CreatedAt));
        }

        return (dtos, total);
    }
}

public class GetWaitlistPositionQueryHandler : IRequestHandler<GetWaitlistPositionQuery, int>
{
    private readonly IWaitlistService _service;

    public GetWaitlistPositionQueryHandler(IWaitlistService service) => _service = service;

    public async Task<int> Handle(GetWaitlistPositionQuery request, CancellationToken ct) =>
        await _service.GetPositionAsync(request.EntryId, ct);
}
