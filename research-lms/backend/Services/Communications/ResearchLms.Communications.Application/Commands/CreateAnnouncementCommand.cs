using MediatR;
using ResearchLms.Communications.Domain.Entities;
using ResearchLms.Communications.Domain.Enums;
using ResearchLms.Communications.Domain.Interfaces;

namespace ResearchLms.Communications.Application.Commands;

public record CreateAnnouncementCommand(
    string Title,
    string Body,
    AnnouncementPriority Priority,
    string? TargetAudience,
    DateTime ValidFrom,
    DateTime ValidTo
) : IRequest<Guid>;

public class CreateAnnouncementCommandHandler : IRequestHandler<CreateAnnouncementCommand, Guid>
{
    private readonly IAnnouncementRepository _repository;

    public CreateAnnouncementCommandHandler(IAnnouncementRepository repository)
    {
        _repository = repository;
    }

    public async Task<Guid> Handle(CreateAnnouncementCommand request, CancellationToken ct)
    {
        var announcement = new Announcement(
            request.Title,
            request.Body,
            request.Priority,
            request.TargetAudience,
            request.ValidFrom,
            request.ValidTo);

        await _repository.AddAsync(announcement, ct);
        return announcement.Id;
    }
}
