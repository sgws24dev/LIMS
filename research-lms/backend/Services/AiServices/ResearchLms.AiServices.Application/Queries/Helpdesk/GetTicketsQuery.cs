using MediatR;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Domain.Interfaces;
using ResearchLms.Shared.Abstractions;

namespace ResearchLms.AiServices.Application.Queries.Helpdesk;

public record GetTicketsQuery : IRequest<List<TicketDto>>;

public class GetTicketsHandler : IRequestHandler<GetTicketsQuery, List<TicketDto>>
{
    private readonly IHelpdeskTicketRepository _repository;
    private readonly ITenantContext _tenant;

    public GetTicketsHandler(IHelpdeskTicketRepository repository, ITenantContext tenant)
    {
        _repository = repository;
        _tenant = tenant;
    }

    public async Task<List<TicketDto>> Handle(GetTicketsQuery request, CancellationToken ct)
    {
        var tickets = await _repository.GetByTenantAsync(_tenant.TenantId, ct);
        return tickets.Select(t => new TicketDto(
            t.Id, t.ConversationId, t.ConversationSummary, t.Priority.ToString(),
            t.Category, t.AssignedToUserId, t.Status.ToString(), t.CreatedAt, t.ResolvedAt
        )).ToList();
    }
}
