using MediatR;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Domain.Entities;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Commands.Helpdesk;

public record StartConversationCommand(string Topic) : IRequest<Guid>;

public class StartConversationHandler : IRequestHandler<StartConversationCommand, Guid>
{
    private readonly IHelpdeskConversationRepository _repository;
    private readonly ITenantContext _tenant;
    private readonly ICurrentUser _currentUser;

    public StartConversationHandler(IHelpdeskConversationRepository repository, ITenantContext tenant, ICurrentUser currentUser)
    {
        _repository = repository;
        _tenant = tenant;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(StartConversationCommand request, CancellationToken ct)
    {
        var conversation = new HelpdeskConversation(_currentUser.UserId, request.Topic);
        conversation.SetTenant(_tenant.TenantId);
        conversation.MarkCreated(_currentUser.Name);
        await _repository.AddAsync(conversation, ct);
        return conversation.Id;
    }
}
