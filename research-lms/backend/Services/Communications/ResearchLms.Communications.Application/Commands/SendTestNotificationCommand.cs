using MediatR;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Communications.Domain.Enums;
using ResearchLms.Communications.Domain.Interfaces;

namespace ResearchLms.Communications.Application.Commands;

public record SendTestNotificationCommand(Guid TemplateId, string? Email, string? PhoneNumber, string? WebhookUrl) : IRequest;

public class SendTestNotificationCommandHandler : IRequestHandler<SendTestNotificationCommand>
{
    private readonly INotificationTemplateRepository _templateRepo;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly ITeamsNotificationService _teamsService;

    public SendTestNotificationCommandHandler(
        INotificationTemplateRepository templateRepo,
        IEmailService emailService,
        ISmsService smsService,
        ITeamsNotificationService teamsService)
    {
        _templateRepo = templateRepo;
        _emailService = emailService;
        _smsService = smsService;
        _teamsService = teamsService;
    }

    public async Task Handle(SendTestNotificationCommand request, CancellationToken ct)
    {
        var template = await _templateRepo.GetByIdAsync(request.TemplateId, ct)
            ?? throw new KeyNotFoundException($"Template {request.TemplateId} not found");

        switch (template.Channel)
        {
            case NotificationChannel.Email when !string.IsNullOrEmpty(request.Email):
                await _emailService.SendAsync(request.Email, template.Subject, template.Body, ct: ct);
                break;
            case NotificationChannel.Sms when !string.IsNullOrEmpty(request.PhoneNumber):
                await _smsService.SendAsync(request.PhoneNumber, template.Body, ct);
                break;
            case NotificationChannel.Teams when !string.IsNullOrEmpty(request.WebhookUrl):
                await _teamsService.SendAsync(request.WebhookUrl, template.Subject, template.Body, ct: ct);
                break;
        }
    }
}
