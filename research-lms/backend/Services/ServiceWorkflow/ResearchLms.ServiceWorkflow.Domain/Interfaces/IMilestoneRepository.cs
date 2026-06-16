using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Domain.Interfaces;

public interface IMilestoneRepository
{
    Task<RequestMilestone?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<RequestMilestone>> GetByRequestIdAsync(Guid serviceRequestId, CancellationToken ct = default);
    Task AddAsync(RequestMilestone milestone, CancellationToken ct = default);
    Task UpdateAsync(RequestMilestone milestone, CancellationToken ct = default);
}
