using ResearchLms.ServiceWorkflow.Domain.Entities;

namespace ResearchLms.ServiceWorkflow.Domain.Interfaces;

public interface IApprovalRepository
{
    Task<Approval?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Approval>> GetByRequestIdAsync(Guid serviceRequestId, CancellationToken ct = default);
    Task<IReadOnlyList<Approval>> GetPendingForUserAsync(string userId, CancellationToken ct = default);
    Task AddAsync(Approval approval, CancellationToken ct = default);
    Task UpdateAsync(Approval approval, CancellationToken ct = default);
}
