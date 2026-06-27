using MediatR;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Queries.Helpdesk;

public record GetConversationByIdQuery(Guid Id) : IRequest<ConversationDto?>;

public class GetConversationByIdHandler : IRequestHandler<GetConversationByIdQuery, ConversationDto?>
{
    private readonly IHelpdeskConversationRepository _repository;
    private readonly ITenantContext _tenant;

    public GetConversationByIdHandler(IHelpdeskConversationRepository repository, ITenantContext tenant)
    {
        _repository = repository;
        _tenant = tenant;
    }

    public async Task<ConversationDto?> Handle(GetConversationByIdQuery request, CancellationToken ct)
    {
        var c = await _repository.GetByIdAsync(request.Id, ct);
        if (c == null || c.TenantId != _tenant.TenantId) return null;

        return new ConversationDto(
            c.Id, c.UserId, c.Topic, c.Status.ToString(), c.CreatedAt, c.ClosedAt,
            c.Messages.Select(m => new MessageDto(m.Id, m.Role.ToString(), m.Content, m.TokensUsed, m.CreatedAt)).ToList()
        );
    }
}
