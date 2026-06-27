using MediatR;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Communications.Application.DTOs;
using ResearchLms.Communications.Domain.Enums;
using ResearchLms.Communications.Domain.Interfaces;

namespace ResearchLms.Communications.Application.Queries;

public record GetAnnouncementsQuery(
    string? Audience,
    AnnouncementPriority? MinPriority,
    DateTime? From,
    DateTime? To
) : IRequest<IReadOnlyList<AnnouncementDto>>;

public class GetAnnouncementsQueryHandler : IRequestHandler<GetAnnouncementsQuery, IReadOnlyList<AnnouncementDto>>
{
    private readonly IAnnouncementRepository _repository;
    private readonly ITenantContext _tenantContext;

    public GetAnnouncementsQueryHandler(IAnnouncementRepository repository, ITenantContext tenantContext)
    {
        _repository = repository;
        _tenantContext = tenantContext;
    }

    public async Task<IReadOnlyList<AnnouncementDto>> Handle(GetAnnouncementsQuery request, CancellationToken ct)
    {
        var announcements = await _repository.GetAllAsync(
            _tenantContext.TenantId,
            request.Audience,
            request.MinPriority,
            request.From,
            request.To,
            ct);

        return announcements.Select(a => new AnnouncementDto(
            a.Id, a.Title, a.Body, a.Priority.ToString(), a.TargetAudience, a.ValidFrom, a.ValidTo, a.CreatedAt)).ToList();
    }
}
