using MediatR;
using Microsoft.Extensions.Logging;

namespace ResearchLms.Billing.Application.EventHandlers;

public record InvoiceApprovedEvent(Guid InvoiceId) : INotification;

public class InvoiceApprovedEventHandler : INotificationHandler<InvoiceApprovedEvent>
{
    private readonly ILogger<InvoiceApprovedEventHandler> _logger;

    public InvoiceApprovedEventHandler(ILogger<InvoiceApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InvoiceApprovedEvent notification, CancellationToken ct)
    {
        _logger.LogInformation("Invoice {InvoiceId} approved — queued for ERP sync", notification.InvoiceId);
        return Task.CompletedTask;
    }
}
