using ResearchLms.AiServices.Domain.Entities;

namespace ResearchLms.AiServices.Domain.Interfaces;

public interface IHelpdeskTicketRepository
{
    Task<IReadOnlyList<HelpdeskTicket>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default);
    Task<HelpdeskTicket?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(HelpdeskTicket ticket, CancellationToken ct = default);
    Task UpdateAsync(HelpdeskTicket ticket, CancellationToken ct = default);
}
