using MassTransit;
using MediatR;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Enums;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Shared.Events;

namespace ResearchLms.AiServices.Application.Commands.Helpdesk;

public record CreateTicketFromConversationCommand(Guid ConversationId, string ConversationSummary, string Priority, string Category) : IRequest<Guid>;

public class CreateTicketFromConversationHandler : IRequestHandler<CreateTicketFromConversationCommand, Guid>
{
    private readonly IHelpdeskConversationRepository _conversationRepo;
    private readonly IHelpdeskTicketRepository _ticketRepo;
    private readonly ITenantContext _tenant;
    private readonly ICurrentUser _currentUser;
    private readonly IPublishEndpoint _publishEndpoint;

    public CreateTicketFromConversationHandler(
        IHelpdeskConversationRepository conversationRepo,
        IHelpdeskTicketRepository ticketRepo,
        ITenantContext tenant,
        ICurrentUser currentUser,
        IPublishEndpoint publishEndpoint)
    {
        _conversationRepo = conversationRepo;
        _ticketRepo = ticketRepo;
        _tenant = tenant;
        _currentUser = currentUser;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Guid> Handle(CreateTicketFromConversationCommand request, CancellationToken ct)
    {
        var conversation = await _conversationRepo.GetByIdAsync(request.ConversationId, ct);
        if (conversation == null)
            throw new KeyNotFoundException($"Conversation {request.ConversationId} not found");

        var priority = Enum.Parse<TicketPriority>(request.Priority, ignoreCase: true);
        var ticket = new HelpdeskTicket(request.ConversationId, request.ConversationSummary, priority, request.Category);
        ticket.SetTenant(_tenant.TenantId);
        ticket.MarkCreated(_currentUser.Name);
        await _ticketRepo.AddAsync(ticket, ct);

        conversation.MarkPendingTicket();
        await _conversationRepo.UpdateAsync(conversation, ct);

        await _publishEndpoint.Publish(new TicketCreatedEvent(
            ticket.Id,
            request.ConversationId,
            _tenant.TenantId,
            _currentUser.UserId,
            request.ConversationSummary,
            request.Priority,
            request.Category,
            DateTime.UtcNow
        ), ct);

        return ticket.Id;
    }
}
