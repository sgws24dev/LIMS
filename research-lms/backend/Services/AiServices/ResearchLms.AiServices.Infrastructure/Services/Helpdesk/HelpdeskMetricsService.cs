using Microsoft.EntityFrameworkCore;
using ResearchLms.AiServices.Application.DTOs;
using ResearchLms.AiServices.Application.Services;
using ResearchLms.AiServices.Infrastructure.Persistence;

namespace ResearchLms.AiServices.Infrastructure.Services.Helpdesk;

public class HelpdeskMetricsService : IHelpdeskMetricsService
{
    private readonly AiServicesDbContext _context;

    public HelpdeskMetricsService(AiServicesDbContext context) => _context = context;

    public async Task<HelpdeskMetricsDto> GetMetricsAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken ct)
    {
        var conversations = await _context.HelpdeskConversations
            .Where(c => c.TenantId == tenantId && c.CreatedAt >= from && c.CreatedAt <= to)
            .ToListAsync(ct);

        var tickets = await _context.HelpdeskTickets
            .Where(t => t.TenantId == tenantId && t.CreatedAt >= from && t.CreatedAt <= to)
            .ToListAsync(ct);

        var totalConversations = conversations.Count;
        var openConversations = conversations.Count(c => c.Status == Domain.Enums.ConversationStatus.Open);
        var totalTickets = tickets.Count;
        var openTickets = tickets.Count(t => t.Status is Domain.Enums.TicketStatus.New or Domain.Enums.TicketStatus.Assigned or Domain.Enums.TicketStatus.InProgress);
        var ticketsFromChat = tickets.Count;

        var resolvedTickets = tickets.Where(t => t.ResolvedAt.HasValue).ToList();
        var avgResolutionHours = resolvedTickets.Count > 0
            ? resolvedTickets.Average(t => (t.ResolvedAt!.Value - t.CreatedAt).TotalHours)
            : 0;

        return new HelpdeskMetricsDto(
            totalConversations,
            openConversations,
            totalTickets,
            openTickets,
            0, // avgFirstResponseTime — would require response tracking
            avgResolutionHours,
            ticketsFromChat,
            tickets.GroupBy(t => t.Status.ToString()).ToDictionary(g => g.Key, g => g.Count()),
            tickets.GroupBy(t => t.Priority.ToString()).ToDictionary(g => g.Key, g => g.Count())
        );
    }
}
