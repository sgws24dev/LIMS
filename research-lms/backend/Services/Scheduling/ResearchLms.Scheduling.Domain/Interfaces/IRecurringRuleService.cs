using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.ValueObjects;

namespace ResearchLms.Scheduling.Domain.Interfaces;

public interface IRecurringRuleService
{
    Task<int> GenerateInstancesAsync(
        RecurringRule rule,
        DateOnly horizonDate,
        CancellationToken ct);

    IEnumerable<DateTime> PreviewInstances(RecurringRule rule, int count = 10);

    Task CancelFutureInstancesAsync(Guid ruleId, CancellationToken ct);
}

public interface IRecurringRuleRepository
{
    Task<RecurringRule?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<(IEnumerable<RecurringRule> Items, int TotalCount)> GetPagedAsync(
        Guid? userId, Guid? resourceId, Domain.Enums.RecurringRuleStatus? status,
        int page, int pageSize, CancellationToken ct);
    Task<RecurringRule> AddAsync(RecurringRule rule, CancellationToken ct);
    Task UpdateAsync(RecurringRule rule, CancellationToken ct);
    Task<IEnumerable<Booking>> GetFutureInstancesAsync(Guid ruleId, CancellationToken ct);
}
