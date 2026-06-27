using MediatR;
using ResearchLms.Communications.Domain.Enums;
using ResearchLms.Communications.Domain.Interfaces;

namespace ResearchLms.Communications.Application.Commands;

public record UpdateAnnouncementCommand(
    Guid Id,
    string Title,
    string Body,
    AnnouncementPriority Priority,
    string? TargetAudience,
    DateTime ValidFrom,
    DateTime ValidTo
) : IRequest;

public class UpdateAnnouncementCommandHandler : IRequestHandler<UpdateAnnouncementCommand>
{
    private readonly IAnnouncementRepository _repository;

    public UpdateAnnouncementCommandHandler(IAnnouncementRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(UpdateAnnouncementCommand request, CancellationToken ct)
    {
        var announcement = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Announcement {request.Id} not found");

        announcement.Update(
            request.Title,
            request.Body,
            request.Priority,
            request.TargetAudience,
            request.ValidFrom,
            request.ValidTo);

        await _repository.UpdateAsync(announcement, ct);
    }
}
