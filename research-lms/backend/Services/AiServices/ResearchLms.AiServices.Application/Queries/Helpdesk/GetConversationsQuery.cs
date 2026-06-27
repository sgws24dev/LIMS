using MediatR;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Queries.Helpdesk;

public record GetConversationsQuery : IRequest<List<ConversationDto>>;

public class GetConversationsHandler : IRequestHandler<GetConversationsQuery, List<ConversationDto>>
{
    private readonly IHelpdeskConversationRepository _repository;
    private readonly ITenantContext _tenant;
    private readonly ICurrentUser _currentUser;

    public GetConversationsHandler(IHelpdeskConversationRepository repository, ITenantContext tenant, ICurrentUser currentUser)
    {
        _repository = repository;
        _tenant = tenant;
        _currentUser = currentUser;
    }

    public async Task<List<ConversationDto>> Handle(GetConversationsQuery request, CancellationToken ct)
    {
        var conversations = await _repository.GetByUserAsync(_tenant.TenantId, _currentUser.UserId, ct);
        return conversations.Select(c => new ConversationDto(
            c.Id, c.UserId, c.Topic, c.Status.ToString(), c.CreatedAt, c.ClosedAt,
            c.Messages.Select(m => new MessageDto(m.Id, m.Role.ToString(), m.Content, m.TokensUsed, m.CreatedAt)).ToList()
        )).ToList();
    }
}
