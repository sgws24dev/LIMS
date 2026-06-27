using MediatR;
using ResearchLms.Communications.Domain.Enums;
using ResearchLms.Communications.Domain.Interfaces;

namespace ResearchLms.Communications.Application.Commands;

public record UpdateTemplateCommand(
    Guid Id,
    string Name,
    NotificationChannel Channel,
    string Subject,
    string Body,
    bool IsDefault
) : IRequest;

public class UpdateTemplateCommandHandler : IRequestHandler<UpdateTemplateCommand>
{
    private readonly INotificationTemplateRepository _repository;

    public UpdateTemplateCommandHandler(INotificationTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(UpdateTemplateCommand request, CancellationToken ct)
    {
        var template = await _repository.GetByIdAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Template {request.Id} not found");

        template.Update(request.Name, request.Channel, request.Subject, request.Body, request.IsDefault);
        await _repository.UpdateAsync(template, ct);
    }
}
